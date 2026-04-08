"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDocuments,
  deleteDocument as apiDeleteDocument,
} from "./documents";

const DOCUMENTS_KEY = ["documents"] as const;

export const useDocuments = () =>
  useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: fetchDocuments,
  });

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiDeleteDocument,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
  });
};

export const useInvalidateDocuments = () => {
  const queryClient = useQueryClient();
  return useCallback(
    () => void queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
    [queryClient]
  );
};
