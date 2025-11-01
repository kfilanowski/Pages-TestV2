import { Component, Input, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { IconService } from '../../../core/services/icon.service';

/**
 * Angular wrapper component for Iconify web component
 * 
 * Design decisions:
 * - Wraps the iconify-icon web component for Angular integration
 * - Uses IconService to convert custom prefixes to Iconify format
 * - Provides type-safe API for icon usage throughout the app
 * - Supports size and color customization
 * - Handles fallback icons gracefully
 * - Follows Single Responsibility Principle
 * 
 * Usage:
 * <app-iconify-icon icon="FiTarget" [size]="24" color="currentColor" />
 * <app-iconify-icon icon="LuSword" size="20" />
 * <app-iconify-icon icon="GiDragonHead" />
 * 
 * Also supports Iconify format directly:
 * <app-iconify-icon icon="lucide:target" />
 */
@Component({
  selector: 'app-iconify-icon',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Required for web components
  template: `
    @if (iconifyName) {
      <iconify-icon 
        [icon]="iconifyName"
        [width]="sizeAsString"
        [height]="sizeAsString"
        [style.color]="color"
      ></iconify-icon>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    iconify-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class IconifyIconComponent implements OnInit {
  private readonly iconService = inject(IconService);

  /** 
   * Icon name in custom format (FiTarget, LuSword) or Iconify format (lucide:target)
   * Can be undefined for conditional rendering
   */
  @Input() icon?: string;
  
  /** Size in pixels or CSS unit (default: '1em' for inline sizing) */
  @Input() size: string | number = '1em';
  
  /** Icon color (default: 'currentColor' to inherit text color) */
  @Input() color: string = 'currentColor';

  /** Use fallback icon if the specified icon cannot be converted */
  @Input() useFallback: boolean = false;

  /** Converted icon name in Iconify format */
  protected iconifyName: string | null = null;

  ngOnInit(): void {
    this.iconifyName = this.iconService.convertToIconifyFormat(this.icon);
    
    // Use fallback if conversion failed and fallback is enabled
    if (!this.iconifyName && this.useFallback) {
      this.iconifyName = this.iconService.getFallbackIcon();
    }

    // Warn in development if icon cannot be converted
    if (!this.iconifyName && this.icon) {
      console.warn(`Could not convert icon: ${this.icon}`);
    }
  }

  /** Convert size to string for iconify-icon compatibility */
  get sizeAsString(): string {
    return typeof this.size === 'number' ? `${this.size}` : this.size;
  }
}

