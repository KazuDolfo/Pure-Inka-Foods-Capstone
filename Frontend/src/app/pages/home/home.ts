
import { Component, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductCard } from '../../components/product-card/product-card';
import { Product } from '../../../models';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  getProducts = () => this.productService.getProducts();
  isLoading = () => this.productService.isLoadingProducts();
  getError = () => this.productService.getErrorProducts();

  featuredProducts = computed(() => this.getProducts().slice(0, 4));
  suggestedProducts = computed(() => this.getProducts().slice(4, 8));

  constructor(private productService: ProductService) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.productService.loadProducts('', '', 1, 8);
    } catch (err) {
      console.error('Error en Home:', err);
    }
  }
}

