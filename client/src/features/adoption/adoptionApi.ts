import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, toQueryString } from "../../lib/apiClient";
import { queryKeys } from "../../lib/queryKeys";
import type { ApiList, ApiSuccess } from "../../types/api";
import type { AdoptionRequest, AdoptionRequestInput, RequestStatus } from "../../types/models";

export const adoptionApi = {
  list: (status: RequestStatus | null): Promise<ApiList<AdoptionRequest>> =>
    apiClient.get<ApiList<AdoptionRequest>>(`/adoption-requests${toQueryString({ status })}`),
  create: async (input: AdoptionRequestInput): Promise<AdoptionRequest> =>
    (await apiClient.post<ApiSuccess<AdoptionRequest>>("/adoption-requests", input)).data,
  updateStatus: async (id: number, status: RequestStatus): Promise<AdoptionRequest> =>
    (await apiClient.patch<ApiSuccess<AdoptionRequest>>(`/adoption-requests/${id}/status`, { status }))
      .data,
  remove: (id: number): Promise<void> => apiClient.delete(`/adoption-requests/${id}`),
};

export function useAdoptionRequests(status: RequestStatus | null) {
  return useQuery({
    queryKey: queryKeys.requests.list(status),
    queryFn: () => adoptionApi.list(status),
  });
}

/** คำขอรับเลี้ยงกระทบสถานะของสัตว์ด้วย จึง invalidate ทั้ง requests, pets และ stats */
function useInvalidateAdoptionData() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
    ]);
}

export function useCreateAdoptionRequest() {
  const invalidate = useInvalidateAdoptionData();
  return useMutation({ mutationFn: adoptionApi.create, onSuccess: invalidate });
}

export function useUpdateRequestStatus() {
  const invalidate = useInvalidateAdoptionData();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: RequestStatus }) =>
      adoptionApi.updateStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useDeleteAdoptionRequest() {
  const invalidate = useInvalidateAdoptionData();
  return useMutation({ mutationFn: adoptionApi.remove, onSuccess: invalidate });
}
