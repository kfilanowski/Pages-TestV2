import { Component, Input } from '@angular/core';

/**
 * Renders icons from two sources:
 * 1. SVG files in the icons/ folder (resolved at build time via iconSvg path)
 * 2. Emoji characters (rendered as text)
 *
 * SVG icons use a CSS mask so they can be tinted with iconColor.
 * When iconColor is set, it overrides the default currentColor.
 * Emoji icons ignore iconColor (they're already colored).
 *
 * Usage:
 *   <app-iconify-icon [icon]="note.iconSvg || note.icon" [size]="20" />
 *   <app-iconify-icon icon="icons/sword.svg" [size]="24" [iconColor]="'#ff6600'" />
 *   <app-iconify-icon icon="🔥" [size]="20" />
 */
@Component({
  selector: 'app-iconify-icon',
  standalone: true,
  template: `
    @if (isSvg) {
      <div
        class="svg-icon-mask"
        [style.width.px]="parsedSize"
        [style.height.px]="parsedSize"
        [style.background-color]="resolvedColor"
        [style.mask]="'url(' + icon + ') no-repeat center'"
        [style.mask-size]="'contain'"
        [style.-webkit-mask]="'url(' + icon + ') no-repeat center'"
        [style.-webkit-mask-size]="'contain'"
      ></div>
    } @else if (isEmoji) {
      <span class="emoji-icon" [style.font-size.px]="parsedSize">{{ icon }}</span>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .svg-icon-mask {
      display: inline-flex;
      background-color: currentColor;
    }
    .emoji-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
  `]
})
export class IconifyIconComponent {
  /** Icon value: SVG path (e.g. "icons/sword.svg") or emoji text */
  @Input() icon?: string;

  /** Size in pixels (number or string like "20") */
  @Input() set size(v: string | number) {
    this.parsedSize = typeof v === 'string' ? parseInt(v, 10) || 16 : v;
  }

  /** Icon color override (for SVG icons only — ignored for emoji) */
  @Input() iconColor?: string;

  protected parsedSize = 16;

  /** True if icon is a resolved SVG path */
  get isSvg(): boolean {
    return typeof this.icon === 'string' && this.icon.startsWith('icons/');
  }

  /** True if icon looks like an emoji (non-ASCII) */
  get isEmoji(): boolean {
    if (typeof this.icon !== 'string' || this.icon.startsWith('icons/')) return false;
    return [...this.icon].some(c => c.codePointAt(0)! > 0x2000);
  }

  /** Resolved color: explicit iconColor, or currentColor to inherit from text */
  get resolvedColor(): string {
    return this.iconColor || 'currentColor';
  }
}
