'use client'

import { useCallback, useState } from 'react'
import { useApiClient } from '@/hooks/useApiClient'
import {
  getOrg,
  updateOrg,
  listMembers,
  inviteMember,
  removeMember,
  updateMemberRole,
  listApiKeys,
  createApiKey,
  revokeApiKey,
} from '@/lib/api/org'
import type { AuthOrganisation, AuthUser, UserRole, ApiKeyResponse, ApiKeyCreatedResponse } from '@/lib/types'
import { toast } from 'sonner'

interface UseOrgState {
  org: AuthOrganisation | null
  members: AuthUser[]
  apiKeys: ApiKeyResponse[]
  loading: boolean
  error: string | null
}

export function useOrg() {
  const clientOptions = useApiClient()
  const [state, setState] = useState<UseOrgState>({
    org: null,
    members: [],
    apiKeys: [],
    loading: false,
    error: null,
  })

  const fetchOrg = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const org = await getOrg(clientOptions)
      setState((prev) => ({ ...prev, org, loading: false }))
      return org
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement'
      setState((prev) => ({ ...prev, error: message, loading: false }))
      toast.error(message)
      return null
    }
  }, [clientOptions])

  const fetchMembers = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const members = await listMembers(clientOptions)
      setState((prev) => ({ ...prev, members, loading: false }))
      return members
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement'
      setState((prev) => ({ ...prev, error: message, loading: false }))
      toast.error(message)
      return []
    }
  }, [clientOptions])

  const fetchApiKeys = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const apiKeys = await listApiKeys(clientOptions)
      setState((prev) => ({ ...prev, apiKeys, loading: false }))
      return apiKeys
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement'
      setState((prev) => ({ ...prev, error: message, loading: false }))
      toast.error(message)
      return []
    }
  }, [clientOptions])

  const updateOrgDetails = useCallback(
    async (data: Partial<{ name: string; timezone?: string; webhook_url?: string }>) => {
      try {
        const updated = await updateOrg(clientOptions, data)
        setState((prev) => ({ ...prev, org: updated }))
        toast.success('Organisation mise à jour')
        return updated
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
        toast.error(message)
        return null
      }
    },
    [clientOptions],
  )

  const addMember = useCallback(
    async (payload: { email: string; full_name: string; role: UserRole }) => {
      try {
        const member = await inviteMember(clientOptions, payload)
        setState((prev) => ({ ...prev, members: [...prev.members, member] }))
        toast.success('Membre invité')
        return member
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de l\'invitation'
        toast.error(message)
        return null
      }
    },
    [clientOptions],
  )

  const deleteMember = useCallback(
    async (userId: string) => {
      try {
        await removeMember(clientOptions, userId)
        setState((prev) => ({
          ...prev,
          members: prev.members.filter((m) => m.id !== userId),
        }))
        toast.success('Membre supprimé')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la suppression'
        toast.error(message)
      }
    },
    [clientOptions],
  )

  const changeMemberRole = useCallback(
    async (userId: string, role: UserRole) => {
      try {
        const updated = await updateMemberRole(clientOptions, userId, role)
        setState((prev) => ({
          ...prev,
          members: prev.members.map((m) => (m.id === userId ? updated : m)),
        }))
        toast.success('Rôle mis à jour')
        return updated
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
        toast.error(message)
        return null
      }
    },
    [clientOptions],
  )

  const generateApiKey = useCallback(
    async (payload: { name: string; scopes: string[] }) => {
      try {
        const key = await createApiKey(clientOptions, payload)
        setState((prev) => ({
          ...prev,
          apiKeys: [...prev.apiKeys, { ...key, raw_key: undefined }],
        }))
        toast.success('Clé API créée')
        return key
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la création'
        toast.error(message)
        return null
      }
    },
    [clientOptions],
  )

  const deleteApiKey = useCallback(
    async (keyId: string) => {
      try {
        await revokeApiKey(clientOptions, keyId)
        setState((prev) => ({
          ...prev,
          apiKeys: prev.apiKeys.filter((k) => k.id !== keyId),
        }))
        toast.success('Clé API révoquée')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors de la révocation'
        toast.error(message)
      }
    },
    [clientOptions],
  )

  return {
    org: state.org,
    members: state.members,
    apiKeys: state.apiKeys,
    loading: state.loading,
    error: state.error,
    fetchOrg,
    fetchMembers,
    fetchApiKeys,
    updateOrgDetails,
    addMember,
    deleteMember,
    changeMemberRole,
    generateApiKey,
    deleteApiKey,
  }
}
