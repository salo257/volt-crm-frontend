import { useToast } from "primevue/usetoast";

export function useToastCustom() {
  const toast = useToast();

  return {
    success(detail, summary = "Succès", life = 3000) {
      toast.add({ severity: "success", summary, detail, life });
    },
    error(detail, summary = "Erreur", life = 4000) {
      toast.add({ severity: "error", summary, detail, life });
    },
    info(detail, summary = "Info", life = 3000) {
      toast.add({ severity: "info", summary, detail, life });
    },
    warn(detail, summary = "Avertissement", life = 3000) {
      toast.add({ severity: "warn", summary, detail, life });
    }
  };
}

export default useToastCustom;