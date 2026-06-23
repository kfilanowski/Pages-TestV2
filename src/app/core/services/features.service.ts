import { Injectable } from '@angular/core';
import features from '../../../config/features.json';

/**
 * Feature flag interface matching src/config/features.json
 */
export interface FeatureFlags {
  header: boolean;
  footer: boolean;
  breadcrumbs: boolean;
  disclosure_chevrons: boolean;
  folder_count_badges: boolean;
}

/**
 * Provides read-only access to feature flags from src/config/features.json.
 * Flags are baked in at build time — no runtime fetching needed.
 */
@Injectable({
  providedIn: 'root'
})
export class FeaturesService {
  private readonly flags: FeatureFlags = features;

  /** Check if a specific feature is enabled */
  isEnabled<K extends keyof FeatureFlags>(key: K): boolean {
    return this.flags[key];
  }

  /** Get all feature flags (useful for templates with multiple checks) */
  getAll(): FeatureFlags {
    return this.flags;
  }
}
