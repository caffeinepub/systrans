import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { getSecretParameter } from "../utils/urlParams";
import { useInternetIdentity } from "./useInternetIdentity";

const ACTOR_QUERY_KEY = "actor";

const TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Backend connection timed out")), ms),
    ),
  ]);
}

export function useActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;

      if (!isAuthenticated) {
        return await withTimeout(createActorWithConfig(), TIMEOUT_MS);
      }

      const actorOptions = {
        agentOptions: {
          identity,
        },
      };

      const actor = await withTimeout(
        createActorWithConfig(actorOptions),
        TIMEOUT_MS,
      );
      const adminToken = getSecretParameter("caffeineAdminToken") || "";
      await withTimeout(
        actor._initializeAccessControlWithSecret(adminToken),
        TIMEOUT_MS,
      );
      return actor;
    },
    staleTime: Number.POSITIVE_INFINITY,
    enabled: true,
    retry: 2,
    retryDelay: 2000,
  });

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
    isError: actorQuery.isError,
    retry: () => queryClient.resetQueries({ queryKey: [ACTOR_QUERY_KEY] }),
  };
}
