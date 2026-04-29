import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getResumes, deleteResume, updateResume, Resume } from '../../services/resume';

/**
 * Staff+ Data Layer: Resumes Query (v6.8.0)
 * Replaces manual useEffect fetching with resilient TanStack Query logic.
 * Handles automatic caching, background synchronization, and invalidations.
 */
export const useResumesQuery = () => {
    const queryClient = useQueryClient();

    // 1. Fetch Query
    const query = useQuery({
        queryKey: ['resumes'],
        queryFn: async () => {
            const data = await getResumes();
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // 2. Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: deleteResume,
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['resumes'] });
            const previous = queryClient.getQueryData<Resume[]>(['resumes']);
            queryClient.setQueryData(['resumes'], (old: Resume[] | undefined) => 
                old ? old.filter(r => r.id !== id) : []
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['resumes'], context.previous);
            }
        },
    });

    // 3. Rename Mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, title }: { id: string, title: string }) => updateResume(id, { title }),
        onSuccess: (updatedResume) => {
            queryClient.setQueryData(['resumes'], (old: Resume[] | undefined) => 
                old ? old.map(r => r.id === updatedResume.id ? updatedResume : r) : []
            );
            // Also invalidate single resume if we ever have useResumeQuery(id)
            queryClient.invalidateQueries({ queryKey: ['resume', updatedResume.id] });
        },
    });

    return {
        resumes: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        deleteResumeAction: deleteMutation.mutateAsync,
        renameResumeAction: updateMutation.mutateAsync,
    };
};
