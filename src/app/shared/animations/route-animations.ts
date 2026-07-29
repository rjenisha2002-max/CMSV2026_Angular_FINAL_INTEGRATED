import { animate, style, transition, trigger, query, group } from '@angular/animations';

/**
 * Smooth page-to-page transition used on the router-outlet wrapper.
 * Fades + slightly slides the incoming view in while the outgoing view
 * fades out, so navigating between screens (dashboard -> list -> detail,
 * etc.) feels continuous instead of an abrupt swap.
 *
 * Deliberately avoids `position: absolute` overlap tricks (common in
 * route-animation examples) since this app's pages have very different
 * heights — overlapping them briefly causes layout jumps. This trades a
 * moment of shared space during the ~200ms transition for a layout that
 * never jumps.
 *
 * Usage (already wired in app.html):
 *   <div [@routeAnimations]="animationKey(outlet)">
 *     <router-outlet #outlet="outlet"></router-outlet>
 *   </div>
 */
export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter', [style({ opacity: 0, transform: 'translateY(8px)' })], { optional: true }),
    group([
      query(':leave', [animate('150ms ease-in', style({ opacity: 0 }))], { optional: true }),
      query(':enter', [animate('220ms 60ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))], {
        optional: true
      })
    ])
  ])
]);
