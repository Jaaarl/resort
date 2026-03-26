import { describe, it, expect, vi, beforeEach } from 'vitest'
import { faker } from '@faker-js/faker'

// Mock prisma before importing the service
vi.mock('../../lib/prisma', () => ({
  default: {
    room: {
      findUnique: vi.fn(),
    },
    reservation: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    reservationRoom: {
      findFirst: vi.fn(),
    },
    reservationPoolSlot: {
      findUnique: vi.fn(),
    },
    poolSlot: {
      findUnique: vi.fn(),
    },
    poolSlotDisabled: {
      findUnique: vi.fn(),
    },
    addOn: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    reservationAddOn: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}))

import prisma from '../../lib/prisma'
import {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservationStatus,
  cancelReservation,
} from './reservation.service'
import { AppError } from '../../middleware/error'

// Mock the addon service
vi.mock('../addons/addon.service', () => ({
  checkAddOnAvailability: vi.fn().mockResolvedValue(undefined),
}))

describe('Reservation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllReservations', () => {
    it('should return all reservations with included relations', async () => {
      const mockReservation = {
        id: faker.string.uuid(),
        customerName: faker.person.fullName(),
        status: 'PENDING',
        rooms: [],
        poolSlots: [],
        addOns: [],
      }

      vi.mocked(prisma.reservation.findMany).mockResolvedValue([mockReservation])

      const result = await getAllReservations()

      expect(prisma.reservation.findMany).toHaveBeenCalledWith({
        include: {
          rooms: { include: { room: true } },
          poolSlots: { include: { poolSlot: true } },
          addOns: { include: { addOn: true } },
        },
      })
      expect(result).toEqual([mockReservation])
    })
  })

  describe('getReservationById', () => {
    it('should return a reservation with included relations', async () => {
      const mockReservation = {
        id: faker.string.uuid(),
        customerName: faker.person.fullName(),
        status: 'CONFIRMED',
        rooms: [{ room: { name: 'Deluxe' } }],
        poolSlots: [],
        addOns: [],
      }

      vi.mocked(prisma.reservation.findUnique).mockResolvedValue(mockReservation)

      const id = mockReservation.id
      const result = await getReservationById(id)

      expect(prisma.reservation.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          rooms: { include: { room: true } },
          poolSlots: { include: { poolSlot: true } },
          addOns: { include: { addOn: true } },
        },
      })
      expect(result).toEqual(mockReservation)
    })

    it('should throw AppError if reservation not found', async () => {
      vi.mocked(prisma.reservation.findUnique).mockResolvedValue(null)

      await expect(getReservationById('non-existent-id')).rejects.toThrow(
        AppError,
      )
      await expect(getReservationById('non-existent-id')).rejects.toThrow(
        'Reservation not found',
      )
    })
  })

  describe('updateReservationStatus', () => {
    it('should update reservation status', async () => {
      const mockReservation = {
        id: faker.string.uuid(),
        status: 'PENDING',
      }

      vi.mocked(prisma.reservation.findUnique).mockResolvedValue(mockReservation)
      vi.mocked(prisma.reservation.update).mockResolvedValue({
        ...mockReservation,
        status: 'CONFIRMED',
      })

      const result = await updateReservationStatus(mockReservation.id, {
        status: 'CONFIRMED',
      })

      expect(prisma.reservation.update).toHaveBeenCalledWith({
        where: { id: mockReservation.id },
        data: { status: 'CONFIRMED' },
      })
      expect(result.status).toBe('CONFIRMED')
    })
  })

  describe('cancelReservation', () => {
    it('should cancel a reservation with PENDING status', async () => {
      const mockReservation = {
        id: faker.string.uuid(),
        status: 'PENDING',
      }

      vi.mocked(prisma.reservation.findUnique).mockResolvedValue(mockReservation)
      vi.mocked(prisma.reservation.update).mockResolvedValue({
        ...mockReservation,
        status: 'CANCELLED',
      })

      const result = await cancelReservation(mockReservation.id)

      expect(result.status).toBe('CANCELLED')
    })

    it('should throw error when cancelling COMPLETED reservation', async () => {
      const mockReservation = {
        id: faker.string.uuid(),
        status: 'COMPLETED',
      }

      vi.mocked(prisma.reservation.findUnique).mockResolvedValue(mockReservation)

      await expect(cancelReservation(mockReservation.id)).rejects.toThrow(
        'Cannot cancel a completed reservation',
      )
    })
  })

  describe('createReservation - Room Conflict Detection', () => {
    it('should throw error when room is not found', async () => {
      vi.mocked(prisma.room.findUnique).mockResolvedValue(null)

      const input = {
        customerName: faker.person.fullName(),
        customerPhone: '09123456789',
        type: 'ROOM' as const,
        totalPerson: 2,
        totalAmount: 2500,
        rooms: [
          {
            roomId: 'non-existent-room',
            checkIn: '2026-04-01',
            checkOut: '2026-04-03',
          },
        ],
      }

      await expect(createReservation(input)).rejects.toThrow('Room not found')
    })

    it('should throw error when room is not active', async () => {
      vi.mocked(prisma.room.findUnique).mockResolvedValue({
        id: 'room-1',
        name: 'Deluxe',
        price: 2500,
        capacity: 2,
        isActive: false,
        description: null,
      })

      const input = {
        customerName: faker.person.fullName(),
        customerPhone: '09123456789',
        type: 'ROOM' as const,
        totalPerson: 2,
        totalAmount: 2500,
        rooms: [
          {
            roomId: 'room-1',
            checkIn: '2026-04-01',
            checkOut: '2026-04-03',
          },
        ],
      }

      await expect(createReservation(input)).rejects.toThrow(
        'Room is not available',
      )
    })

    it('should throw error when totalPerson exceeds room capacity', async () => {
      vi.mocked(prisma.room.findUnique).mockResolvedValue({
        id: 'room-1',
        name: 'Deluxe',
        price: 2500,
        capacity: 2,
        isActive: true,
        description: null,
      })

      const input = {
        customerName: faker.person.fullName(),
        customerPhone: '09123456789',
        type: 'ROOM' as const,
        totalPerson: 5, // exceeds capacity of 2
        totalAmount: 2500,
        rooms: [
          {
            roomId: 'room-1',
            checkIn: '2026-04-01',
            checkOut: '2026-04-03',
          },
        ],
      }

      await expect(createReservation(input)).rejects.toThrow(
        'Room capacity is 2 persons only',
      )
    })

    it('should throw error when room has booking conflict', async () => {
      vi.mocked(prisma.room.findUnique).mockResolvedValue({
        id: 'room-1',
        name: 'Deluxe',
        price: 2500,
        capacity: 2,
        isActive: true,
        description: null,
      })

      // Existing booking that conflicts
      vi.mocked(prisma.reservationRoom.findFirst).mockResolvedValue({
        id: 'existing-booking',
        reservationId: 'res-1',
        roomId: 'room-1',
        checkIn: new Date('2026-04-01'),
        checkOut: new Date('2026-04-05'),
      })

      const input = {
        customerName: faker.person.fullName(),
        customerPhone: '09123456789',
        type: 'ROOM' as const,
        totalPerson: 2,
        totalAmount: 2500,
        rooms: [
          {
            roomId: 'room-1',
            checkIn: '2026-04-02', // overlaps with existing
            checkOut: '2026-04-04',
          },
        ],
      }

      await expect(createReservation(input)).rejects.toThrow(
        'Room is already booked for these dates',
      )
    })
  })

  describe('createReservation - Pool Conflict Detection', () => {
    it('should throw error when pool slot is not found', async () => {
      vi.mocked(prisma.poolSlot.findUnique).mockResolvedValue(null)

      const input = {
        customerName: faker.person.fullName(),
        customerPhone: '09123456789',
        type: 'POOL' as const,
        totalPerson: 2,
        totalAmount: 400,
        poolSlots: [
          {
            poolSlotId: 'non-existent-slot',
            poolDate: '2026-04-01',
          },
        ],
      }

      await expect(createReservation(input)).rejects.toThrow(
        'Pool slot not found',
      )
    })

    it('should throw error when pool slot is disabled on date', async () => {
      vi.mocked(prisma.poolSlot.findUnique).mockResolvedValue({
        id: 'slot-1',
        label: 'MORNING',
        startTime: '06:00',
        endTime: '12:00',
        capacity: 50,
        price: 200,
      })

      vi.mocked(prisma.poolSlotDisabled.findUnique).mockResolvedValue({
        id: 'disabled-1',
        label: 'MORNING',
        date: new Date('2026-04-01'),
        reason: 'Maintenance',
        createdAt: new Date(),
      })

      const input = {
        customerName: faker.person.fullName(),
        customerPhone: '09123456789',
        type: 'POOL' as const,
        totalPerson: 2,
        totalAmount: 400,
        poolSlots: [
          {
            poolSlotId: 'slot-1',
            poolDate: '2026-04-01',
          },
        ],
      }

      await expect(createReservation(input)).rejects.toThrow(
        'MORNING slot is not available on this date: Maintenance',
      )
    })

    it('should throw error when pool slot is already reserved', async () => {
      vi.mocked(prisma.poolSlot.findUnique).mockResolvedValue({
        id: 'slot-1',
        label: 'MORNING',
        startTime: '06:00',
        endTime: '12:00',
        capacity: 50,
        price: 200,
      })

      vi.mocked(prisma.poolSlotDisabled.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.reservationPoolSlot.findUnique).mockResolvedValue({
        id: 'existing-reservation',
        reservationId: 'res-1',
        poolSlotId: 'slot-1',
        poolDate: new Date('2026-04-01'),
      })

      const input = {
        customerName: faker.person.fullName(),
        customerPhone: '09123456789',
        type: 'POOL' as const,
        totalPerson: 2,
        totalAmount: 400,
        poolSlots: [
          {
            poolSlotId: 'slot-1',
            poolDate: '2026-04-01',
          },
        ],
      }

      await expect(createReservation(input)).rejects.toThrow(
        'MORNING slot is already reserved on this date',
      )
    })
  })
})
