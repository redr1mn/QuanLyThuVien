import { create } from 'zustand';
import { membersApi } from '../../members/api/members-api';
import { catalogApi } from '../../catalog/api/catalog-api';
import { getApiErrorMessage } from '../../../shared/api/api-error';
import type { MemberListItem } from '../../../shared/schemas/members';
import type { BookListItem, BookCopy } from '../../../shared/schemas/catalog';

type LookupState = {
  members: MemberListItem[]; books: BookListItem[]; copies: BookCopy[]; bookId: number; pending: number; error: string | null;
  findMembers: (query: string) => Promise<void>; findBooks: (query: string) => Promise<void>; selectBook: (id: number) => Promise<void>;
};
let membersRequest = 0, booksRequest = 0, copiesRequest = 0;
export const useLoanLookupStore = create<LookupState>((set) => ({
  members: [], books: [], copies: [], bookId: 0, pending: 0, error: null,
  findMembers: async query => {
    const requestId = ++membersRequest;
    set(state => ({ pending: state.pending + 1, error: null }));
    try { const result = await membersApi.list({ query, status: 'Active', pageSize: 100 }); if (requestId === membersRequest) set({ members: result.items }); }
    catch (error) { set({ error: getApiErrorMessage(error) }); }
    finally { set(state => ({ pending: state.pending - 1 })); }
  },
  findBooks: async query => {
    const requestId = ++booksRequest;
    set(state => ({ pending: state.pending + 1, error: null }));
    try { const result = await catalogApi.list({ query, availableOnly: true, pageSize: 100 }); if (requestId === booksRequest) set({ books: result.items }); }
    catch (error) { set({ error: getApiErrorMessage(error) }); }
    finally { set(state => ({ pending: state.pending - 1 })); }
  },
  selectBook: async id => {
    const requestId = ++copiesRequest;
    set(state => ({ bookId: id, copies: [], pending: state.pending + 1, error: null }));
    try { if (id) { const result = await catalogApi.get(id); if (requestId === copiesRequest) set(state => ({ copies: result.copies.filter(copy => copy.status === 'Available'), books: state.books.some(book => book.id === id) ? state.books : [...state.books, { ...result, availableCopies: result.copies.filter(copy => copy.status === 'Available').length, totalCopies: result.copies.length }] })); } }
    catch (error) { set({ error: getApiErrorMessage(error) }); }
    finally { set(state => ({ pending: state.pending - 1 })); }
  },
}));
