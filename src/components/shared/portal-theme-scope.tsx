'use client';

import { useEffect } from 'react';

import { THEME } from '@/constants';
import type { PortalId } from '@/themes';

/**
 * Syncs `data-portal` on `<html>` for the active route group so portaled
 * overlays (Sheet, Dialog) inherit the correct token set.
 *
 * Layout wrappers also set `data-portal` on themselves for SSR-correct
 * subtree tokens; this keeps `<html>` aligned after hydration.
 */
export function PortalThemeScope({ portal }: { portal: PortalId }) {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute(THEME.portalAttribute);

    root.setAttribute(THEME.portalAttribute, portal);

    return () => {
      if (previous) {
        root.setAttribute(THEME.portalAttribute, previous);
      } else {
        root.removeAttribute(THEME.portalAttribute);
      }
    };
  }, [portal]);

  return null;
}
