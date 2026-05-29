export function useAnalytics() {
  const track = (event, props = {}) => {
    if (typeof window !== "undefined" && window.va) {
      window.va("event", { name: event, ...props });
    }
  };
  return { track };
}
