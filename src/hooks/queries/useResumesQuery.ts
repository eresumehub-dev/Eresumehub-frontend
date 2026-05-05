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
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['resumes'] });
            await queryClient.cancelQueries({ queryKey: ['bootstrap'] });

            const previousResumes = queryClient.getQueryData<Resume[]>(['resumes']);
            const previousBootstrap = queryClient.getQueryData<any>(['bootstrap']);

            // Optimistically update 'resumes' cache
            queryClient.setQueryData(['resumes'], (old: Resume[] | undefined) => 
                old ? old.filter(r => r.id !== id) : []
            );

            // Optimistically update 'bootstrap' cache (v16.5.10)
            // This ensures the Dashboard (which observes bootstrap) updates instantly
            queryClient.setQueryData(['bootstrap'], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    resumes: Array.isArray(old.resumes) 
                        ? old.resumes.filter((r: any) => r.id !== id) 
                        : []
                };
            });

            return { previousResumes, previousBootstrap };
        },
        onError: (_err, _id, context) => {
            if (context?.previousResumes) {
                queryClient.setQueryData(['resumes'], context.previousResumes);
            }
            if (context?.previousBootstrap) {
                queryClient.setQueryData(['bootstrap'], context.previousBootstrap);
            }
        },
        onSettled: () => {
            // Always refetch to ensure synchronization
            queryClient.invalidateQueries({ queryKey: ['resumes'] });
            queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
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
