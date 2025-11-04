import { Component, Input, CUSTOM_ELEMENTS_SCHEMA, OnInit, AfterViewInit, OnChanges, SimpleChanges, ElementRef, ChangeDetectorRef, inject } from '@angular/core';
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
 * - Detects when icons fail to load and provides helpful warnings
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
export class IconifyIconComponent implements OnInit, AfterViewInit, OnChanges {
  private readonly iconService = inject(IconService);
  private readonly elementRef = inject(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);

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
  
  /** List of icon candidates to try (for cascading fallback) */
  private iconCandidates: string[] = [];
  private currentCandidateIndex = 0;
  private afterViewInitCalled = false;
  
  /** Retry configuration for handling transient network failures */
  private readonly MAX_RETRIES = 3;
  private retryCount = 0;
  private readonly RETRY_DELAYS = [100, 300, 1000]; // Progressive backoff in ms

  ngOnInit(): void {
    // Wait for Iconify to be ready before initializing
    this.waitForIconify().then(() => {
      this.initializeIcon();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // React to icon input changes (e.g., when navigating between pages)
    if (changes['icon'] && !changes['icon'].firstChange) {
      this.initializeIcon();
      
      // If AfterViewInit has already run, restart the fallback detection
      if (this.afterViewInitCalled) {
        const iconElement = this.elementRef.nativeElement.querySelector('iconify-icon');
        if (iconElement && this.iconCandidates.length > 0) {
          this.tryNextIconCandidate(iconElement);
        }
      }
    }
  }

  ngAfterViewInit(): void {
    this.afterViewInitCalled = true;
    // Start the cascading fallback detection
    const iconElement = this.elementRef.nativeElement.querySelector('iconify-icon');
    if (iconElement && this.iconCandidates.length > 0) {
      this.tryNextIconCandidate(iconElement);
    }
  }

  /**
   * Initializes or re-initializes the icon
   * Used both on init and when icon input changes
   */
  private initializeIcon(): void {
    // Reset state
    this.currentCandidateIndex = 0;
    this.retryCount = 0;
    
    // Generate list of icon candidates (primary + fallbacks)
    this.iconCandidates = this.iconService.getIconFallbackCandidates(this.icon);
    
    if (this.iconCandidates.length > 0) {
      // Start with the first candidate (original conversion)
      this.iconifyName = this.iconCandidates[0];
    } else if (this.useFallback) {
      // If no candidates and fallback enabled, use default
      this.iconifyName = this.iconService.getFallbackIcon();
    } else if (this.icon) {
      console.warn(`Could not convert icon: ${this.icon}`);
    }
  }

  /**
   * Tries icon candidates in sequence until one loads successfully
   * 
   * Design decision:
   * - Uses cascading fallback across multiple icon libraries
   * - Automatically finds a working icon without manual intervention
   * - Implements retry logic with progressive backoff for transient failures
   * - Optimized timing: 50ms initial check, progressive retries, 20ms between library fallbacks
   * - Logs which library was used for debugging
   * - Falls back to default icon if none work
   */
  private tryNextIconCandidate(iconElement: HTMLElement): void {
    // Give the current icon time to load (50ms for first attempt, longer for retries)
    const delay = this.retryCount === 0 ? 50 : this.RETRY_DELAYS[this.retryCount - 1] || 1000;
    
    setTimeout(() => {
      const hasSvg = iconElement.shadowRoot?.querySelector('svg');
      
      if (!hasSvg) {
        // Current icon failed to load - try retry logic first
        if (this.retryCount < this.MAX_RETRIES) {
          // Retry the same icon (handles transient network failures)
          this.retryCount++;
          this.tryNextIconCandidate(iconElement);
          return;
        }
        
        // Max retries exhausted, try next library
        this.retryCount = 0; // Reset retry counter for next candidate
        this.currentCandidateIndex++;
        
        if (this.currentCandidateIndex < this.iconCandidates.length) {
          // Try next candidate from different library
          const nextCandidate = this.iconCandidates[this.currentCandidateIndex];
          this.iconifyName = nextCandidate;
          
          // Trigger Angular change detection to update the template
          this.cdr.detectChanges();
          
          // Recursively try next candidate (minimal delay)
          setTimeout(() => this.tryNextIconCandidate(iconElement), 20);
        } else {
          // All candidates failed
          this.handleAllCandidatesFailed();
        }
      } else {
        // Icon loaded successfully!
        if (this.currentCandidateIndex > 0 || this.retryCount > 0) {
          // We used a fallback or retry, log it for awareness
          const [originalLibrary] = this.iconCandidates[0].split(':');
          const [usedLibrary] = this.iconifyName!.split(':');
          
          if (this.retryCount > 0) {
            console.log(
              `%c✓ Icon loaded after ${this.retryCount} ${this.retryCount === 1 ? 'retry' : 'retries'}: ${this.icon}`,
              'color: #2196F3; font-weight: bold;',
              `\n  Icon: ${this.iconifyName}`
            );
          } else {
            console.log(
              `%c✓ Icon fallback: ${this.icon}`,
              'color: #4CAF50; font-weight: bold;',
              `\n  Original: ${this.iconCandidates[0]} (not found in ${originalLibrary})`,
              `\n  Using: ${this.iconifyName} (found in ${usedLibrary})`
            );
          }
        }
      }
    }, delay);
  }

  /**
   * Handles the case where all icon candidates failed to load
   */
  private handleAllCandidatesFailed(): void {
    const [, iconName] = this.iconCandidates[0].split(':');
    
    console.group(`⚠️ Icon not found in any library: ${this.icon}`);
    console.warn(`Tried ${this.iconCandidates.length} libraries:`);
    this.iconCandidates.forEach((candidate, index) => {
      const [library] = candidate.split(':');
      console.log(`  ${index + 1}. ${candidate} (${library}) ✗`);
    });
    console.log('%cSuggestions:', 'font-weight: bold; color: #FF9800;');
    console.log(`1. The icon name "${iconName}" doesn't exist in any library`);
    console.log('2. Search for similar icons: https://icon-sets.iconify.design/');
    console.log('3. Common alternatives:');
    console.log(`   - For "target": GiTarget, LuTarget, FaTarget`);
    console.log(`   - For "sword": GiSword, LuSword, FaSword`);
    console.log(`   - For "shield": GiShield, LuShield, FaShield`);
    console.log('4. Check the Icon Usage Guide in your assets folder');
    console.groupEnd();
    
    // Use ultimate fallback if enabled
    if (this.useFallback) {
      this.iconifyName = this.iconService.getFallbackIcon();
    }
  }

  /** Convert size to string for iconify-icon compatibility */
  get sizeAsString(): string {
    return typeof this.size === 'number' ? `${this.size}` : this.size;
  }

  /**
   * Waits for Iconify web component to be fully defined
   * Prevents race conditions where Angular tries to use icons before Iconify is ready
   * 
   * @returns Promise that resolves when Iconify is ready
   */
  private waitForIconify(): Promise<void> {
    return new Promise((resolve) => {
      // Check if we're on the server (SSR)
      if (typeof window === 'undefined' || typeof customElements === 'undefined') {
        resolve();
        return;
      }

      // Check if iconify-icon web component is already defined
      if (customElements.get('iconify-icon')) {
        resolve();
        return;
      }

      // Wait for iconify-icon to be defined (with timeout)
      const timeout = setTimeout(() => {
        console.warn('Iconify web component took too long to load');
        resolve(); // Resolve anyway to prevent blocking
      }, 5000);

      customElements.whenDefined('iconify-icon').then(() => {
        clearTimeout(timeout);
        resolve();
      }).catch(() => {
        clearTimeout(timeout);
        console.warn('Failed to load Iconify web component');
        resolve();
      });
    });
  }
}

