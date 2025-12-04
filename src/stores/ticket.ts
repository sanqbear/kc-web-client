import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ticketApi, entryApi } from '@/utils/api'
import type {
  TicketListResponse,
  TicketDetailResponse,
  CreateTicketRequest,
  UpdateTicketRequest,
  SearchTicketRequest,
  CreateEntryRequest,
} from '@/types/ticket'

export const useTicketStore = defineStore('ticket', () => {
  const tickets = ref<TicketListResponse[]>([])
  const currentTicket = ref<TicketDetailResponse | null>(null)
  const totalCount = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTickets(page = 1, limit = 10) {
    loading.value = true
    error.value = null

    try {
      const response = await ticketApi.list(page, limit)
      tickets.value = response.data
      totalCount.value = response.total_count
      totalPages.value = response.total_pages
      currentPage.value = response.page
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch tickets'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchTicket(id: string) {
    loading.value = true
    error.value = null

    try {
      currentTicket.value = await ticketApi.get(id)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch ticket'
      return false
    } finally {
      loading.value = false
    }
  }

  async function createTicket(data: CreateTicketRequest) {
    loading.value = true
    error.value = null

    try {
      const ticket = await ticketApi.create(data)
      currentTicket.value = ticket
      return ticket
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create ticket'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateTicket(id: string, data: UpdateTicketRequest) {
    loading.value = true
    error.value = null

    try {
      await ticketApi.update(id, data)
      if (currentTicket.value?.id === id) {
        await fetchTicket(id)
      }
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update ticket'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteTicket(id: string) {
    loading.value = true
    error.value = null

    try {
      await ticketApi.delete(id)
      tickets.value = tickets.value.filter((t) => t.id !== id)
      if (currentTicket.value?.id === id) {
        currentTicket.value = null
      }
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete ticket'
      return false
    } finally {
      loading.value = false
    }
  }

  async function searchTickets(
    searchData: SearchTicketRequest,
    page = 1,
    limit = 10,
  ) {
    loading.value = true
    error.value = null

    try {
      const response = await ticketApi.search(searchData, page, limit)
      tickets.value = response.data
      totalCount.value = response.total_count
      totalPages.value = response.total_pages
      currentPage.value = response.page
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to search tickets'
      return false
    } finally {
      loading.value = false
    }
  }

  async function addEntry(ticketId: string, data: CreateEntryRequest) {
    loading.value = true
    error.value = null

    try {
      const entry = await entryApi.create(ticketId, data)
      if (currentTicket.value?.id === ticketId) {
        currentTicket.value.entries = [
          ...(currentTicket.value.entries || []),
          entry,
        ]
      }
      return entry
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add entry'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteEntry(ticketId: string, entryId: number) {
    loading.value = true
    error.value = null

    try {
      await entryApi.delete(entryId)
      if (currentTicket.value?.id === ticketId) {
        currentTicket.value.entries = currentTicket.value.entries?.filter(
          (e) => e.id !== entryId,
        )
      }
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete entry'
      return false
    } finally {
      loading.value = false
    }
  }

  function clearCurrentTicket() {
    currentTicket.value = null
  }

  return {
    tickets,
    currentTicket,
    totalCount,
    totalPages,
    currentPage,
    loading,
    error,
    fetchTickets,
    fetchTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    searchTickets,
    addEntry,
    deleteEntry,
    clearCurrentTicket,
  }
})
