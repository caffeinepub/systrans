import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { getSecretParameter } from "../utils/urlParams";
import { useInternetIdentity } from "./useInternetIdentity";

const ACTOR_QUERY_KEY = "actor";
const ACTOR_TIMEOUT_MS = 15000;

export function useActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(new Error("Backend connection timed out after 15 seconds")),
          ACTOR_TIMEOUT_MS,
        ),
      );

      const actorPromise = (async () => {
        if (!isAuthenticated) {
          return await createActorWithConfig();
        }
        const actorOptions = {
          agentOptions: {
            identity,
          },
        };
        const actor = await createActorWithConfig(actorOptions);
        const adminToken = getSecretParameter("caffeineAdminToken") || "";
        await actor._initializeAccessControlWithSecret(adminToken);
        return actor;
      })();

      return Promise.race([actorPromise, timeoutPromise]);
    },
    staleTime: Number.POSITIVE_INFINITY,
    retry: 2,
    retryDelay: 2000,
    enabled: true,
  });

  // When the actor changes, invalidate dependent queries
  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
    error: actorQuery.error,
    refetch: actorQuery.refetch,
  };
}
