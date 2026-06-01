import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AdminService } from '../../../../services/admin.service';
import { ProductService } from '../../../../services/product.service';
import { ApiCategory, Product } from '../../../../models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class ProductsComponent implements OnInit {
  categoryForm: FormGroup;
  productForm: FormGroup;
  editProductForm: FormGroup;

  selectedFile: File | null = null;
  selectedEditFile: File | null = null;
  selectedProduct = signal<Product | null>(null);

  showAddProductModal = signal(false);
  showAddCategoryModal = signal(false);
  editingStockId: number | null = null;

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    public adminService: AdminService,
    public productService: ProductService
  ) {
    this.categoryForm = this.fb.group({
      nombre: ['', Validators.required]
    });

    this.productForm = this.fb.group({
      sku: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      id_categoria: [''],
      precio: ['', [Validators.required, Validators.min(0)]],
      stock_actual: [0, [Validators.required, Validators.min(0)]],
      imagen_url: ['']
    });

    this.editProductForm = this.fb.group({
      id_producto: [''],
      sku: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      id_categoria: [''],
      precio: ['', [Validators.required, Validators.min(0)]],
      imagen_url: ['']
    });
  }

  async ngOnInit() {
    await this.productService.loadCategories();
    // Aumentamos el límite a 100 para que el admin vea todos los productos de una vez
    await this.productService.loadProducts('', '', 1, 100);
  }

  onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.selectedFile = element.files[0];
      
      this.productForm.patchValue({ imagen_url: this.selectedFile.name });
    }
  }

  onEditFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.selectedEditFile = element.files[0];
      this.editProductForm.patchValue({ imagen_url: this.selectedEditFile.name });
    }
  }

  onAddCategory() {
    if (this.categoryForm.valid) {
      this.adminService.addCategory(this.categoryForm.value).subscribe({
        next: () => {
          this.showMessage('Categoría añadida');
          this.categoryForm.reset();
          this.productService.loadCategories();
          this.showAddCategoryModal.set(false);
        },
        error: (err) => this.showError(err.message)
      });
    }
  }

  onAddProduct() {
    if (this.productForm.valid) {
      const formData = new FormData();
      formData.append('sku', this.productForm.value.sku);
      formData.append('nombre', this.productForm.value.nombre);
      formData.append('descripcion', this.productForm.value.descripcion || '');
      formData.append('id_categoria', this.productForm.value.id_categoria);
      formData.append('precio', this.productForm.value.precio.toString());
      formData.append('stock_actual', this.productForm.value.stock_actual.toString());
      
      
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.adminService.addProduct(formData).subscribe({
        next: () => {
          this.showMessage('Producto creado exitosamente');
          this.productForm.reset({ stock_actual: 0 });
          this.selectedFile = null;
          this.productService.loadProducts('', '', 1, 100);
          this.showAddProductModal.set(false);
        },
        error: (err) => this.showError(err.message || 'Error al crear producto.')
      });
    }
  }

  onEditProduct(product: Product) {
    this.selectedProduct.set(product);
    this.selectedEditFile = null;
    this.editProductForm.patchValue({
      id_producto: product.id,
      sku: product.sku,
      nombre: product.name,
      descripcion: product.description,
      id_categoria: product.id_categoria,
      precio: product.price
    });
  }

  onUpdateProduct() {
    if (this.editProductForm.valid) {
      const id = this.editProductForm.value.id_producto;
      const formData = new FormData();
      formData.append('sku', this.editProductForm.value.sku);
      formData.append('nombre', this.editProductForm.value.nombre);
      formData.append('descripcion', this.editProductForm.value.descripcion || '');
      formData.append('id_categoria', this.editProductForm.value.id_categoria);
      formData.append('precio', this.editProductForm.value.precio.toString());
      
      if (this.selectedEditFile) {
        formData.append('image', this.selectedEditFile);
      }

      this.adminService.updateProduct(id, formData).subscribe({
        next: () => {
          this.showMessage('Producto actualizado');
          this.selectedProduct.set(null);
          this.productService.loadProducts('', '', 1, 100);
        },
        error: (err) => this.showError(err.message)
      });
    }
  }

  onUpdateStock(product: Product, event: any) {
    const newVal = parseInt(event.target.value, 10);
    const diff = newVal - product.stock;
    
    if (diff === 0) {
      this.editingStockId = null;
      return;
    }

    const data = {
      cantidad: Math.abs(diff),
      tipo: (diff > 0 ? 'ENTRADA' : 'SALIDA') as 'ENTRADA' | 'SALIDA',
      motivo: 'Ajuste manual desde panel Admin'
    };

    this.adminService.updateStock(product.id, data).subscribe({
      next: () => {
        this.showMessage('Stock actualizado');
        this.productService.loadProducts('', '', 1, 100);
        this.editingStockId = null;
      },
      error: (err) => this.showError(err.message)
    });
  }

  onDeleteProduct(id: number) {
    if (confirm('¿Eliminar este producto?')) {
      this.adminService.deleteProduct(id).subscribe({
        next: () => {
          this.showMessage('Producto eliminado');
          this.productService.loadProducts('', '', 1, 100);
        },
        error: (err) => this.showError(err.message)
      });
    }
  }

  private showMessage(msg: string) {
    this.successMessage.set(msg);
    this.errorMessage.set(null);
    setTimeout(() => this.successMessage.set(null), 3000);
  }

  private showError(msg: string) {
    this.errorMessage.set(msg);
    this.successMessage.set(null);
  }
}

