import { useRole } from '@/lib/roleContext';
import { Button } from '@/components/ui/button';
import { X, Eye } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

export function RolePreviewBanner() {
  const { previewRole, setPreviewRole, isPreviewMode } = useRole();

  if (!isPreviewMode || !previewRole) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary via-primary/90 to-primary border-b-4 shadow-lg"
        style={{ borderBottomColor: previewRole.color }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-foreground/20">
                <Eye className="w-5 h-5 text-primary-foreground" weight="fill" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg uppercase text-primary-foreground tracking-wide">
                    Preview Mode
                  </h3>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: previewRole.color,
                      color: 'oklch(0.98 0 0)',
                    }}
                  >
                    {previewRole.name}
                  </span>
                </div>
                <p className="text-sm text-primary-foreground/80">
                  Viewing the app as a user with this role. Some features may be hidden.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setPreviewRole(null)}
              variant="secondary"
              size="sm"
              className="gap-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-primary-foreground/30"
            >
              <X className="w-4 h-4" />
              Exit Preview
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
