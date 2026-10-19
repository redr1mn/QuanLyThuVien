import { httpClient } from '../../../shared/api/http-client';
export const reservationsApi = { async create(memberId: number, bookId: number) { return httpClient.post('/reservations', { memberId, bookId }); }, async cancel(id: number) { return httpClient.delete(`/reservations/${id}`); } };
