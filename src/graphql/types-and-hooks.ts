import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions
} from '@tanstack/react-query'
import { GraphQLClient } from 'graphql-request'
import { RequestInit } from 'graphql-request/dist/types.dom'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}

function fetcher<TData, TVariables>(
  client: GraphQLClient,
  query: string,
  variables?: TVariables,
  headers?: RequestInit['headers']
) {
  return async (): Promise<TData> =>
    client.request<TData, TVariables>(query, variables, headers)
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  /**
   * The `Date` scalar type represents a date. The Date appears in a JSON
   * response as an ISO8601 formatted string, without a time component.
   */
  Date: any
  /**
   * The `Decimal` scalar type represents signed double-precision fractional
   * values parsed by the `Decimal` library.  The Decimal appears in a JSON
   * response as a string to preserve precision.
   */
  Decimal: any
  /**
   * The `Naive DateTime` scalar type represents a naive date and time without
   * timezone. The DateTime appears in a JSON response as an ISO8601 formatted
   * string.
   */
  NaiveDateTime: any
}

export type Author = Node & {
  __typename?: 'Author'
  authoredBooks?: Maybe<BookConnection>
  /** The ID of an object */
  id: Scalars['ID']
  insertedAt: Scalars['NaiveDateTime']
  name: Scalars['String']
  person: Person
  updatedAt: Scalars['NaiveDateTime']
}

export type AuthorAuthoredBooksArgs = {
  after?: InputMaybe<Scalars['String']>
  before?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Int']>
  last?: InputMaybe<Scalars['Int']>
}

export type Book = Node & {
  __typename?: 'Book'
  authors: Array<Author>
  description?: Maybe<Scalars['String']>
  /** The ID of an object */
  id: Scalars['ID']
  imagePath?: Maybe<Scalars['String']>
  insertedAt: Scalars['NaiveDateTime']
  media: Array<Media>
  published: Scalars['Date']
  seriesBooks: Array<SeriesBook>
  title: Scalars['String']
  updatedAt: Scalars['NaiveDateTime']
}

export type BookConnection = {
  __typename?: 'BookConnection'
  edges?: Maybe<Array<Maybe<BookEdge>>>
  pageInfo: PageInfo
}

export type BookEdge = {
  __typename?: 'BookEdge'
  cursor?: Maybe<Scalars['String']>
  node?: Maybe<Book>
}

export type Chapter = {
  __typename?: 'Chapter'
  endTime?: Maybe<Scalars['Float']>
  id: Scalars['ID']
  startTime: Scalars['Float']
  title?: Maybe<Scalars['String']>
}

export type CreateSessionInput = {
  email: Scalars['String']
  password: Scalars['String']
}

export type CreateSessionPayload = {
  __typename?: 'CreateSessionPayload'
  token: Scalars['String']
  user: User
}

export type DeleteSessionPayload = {
  __typename?: 'DeleteSessionPayload'
  deleted: Scalars['Boolean']
}

export type Media = Node & {
  __typename?: 'Media'
  abridged: Scalars['Boolean']
  book: Book
  chapters: Array<Chapter>
  duration?: Maybe<Scalars['Float']>
  fullCast: Scalars['Boolean']
  hlsPath?: Maybe<Scalars['String']>
  /** The ID of an object */
  id: Scalars['ID']
  insertedAt: Scalars['NaiveDateTime']
  mpdPath?: Maybe<Scalars['String']>
  narrators: Array<Narrator>
  playerState?: Maybe<PlayerState>
  updatedAt: Scalars['NaiveDateTime']
}

export type MediaConnection = {
  __typename?: 'MediaConnection'
  edges?: Maybe<Array<Maybe<MediaEdge>>>
  pageInfo: PageInfo
}

export type MediaEdge = {
  __typename?: 'MediaEdge'
  cursor?: Maybe<Scalars['String']>
  node?: Maybe<Media>
}

export type Narrator = Node & {
  __typename?: 'Narrator'
  /** The ID of an object */
  id: Scalars['ID']
  insertedAt: Scalars['NaiveDateTime']
  name: Scalars['String']
  narratedMedia?: Maybe<MediaConnection>
  person: Person
  updatedAt: Scalars['NaiveDateTime']
}

export type NarratorNarratedMediaArgs = {
  after?: InputMaybe<Scalars['String']>
  before?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Int']>
  last?: InputMaybe<Scalars['Int']>
}

export type Node = {
  /** The ID of the object. */
  id: Scalars['ID']
}

export type PageInfo = {
  __typename?: 'PageInfo'
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>
}

export type Person = Node & {
  __typename?: 'Person'
  authors: Array<Author>
  description?: Maybe<Scalars['String']>
  /** The ID of an object */
  id: Scalars['ID']
  imagePath?: Maybe<Scalars['String']>
  insertedAt: Scalars['NaiveDateTime']
  name: Scalars['String']
  narrators: Array<Narrator>
  updatedAt: Scalars['NaiveDateTime']
}

export type PlayerState = Node & {
  __typename?: 'PlayerState'
  /** The ID of an object */
  id: Scalars['ID']
  insertedAt: Scalars['NaiveDateTime']
  media: Media
  playbackRate: Scalars['Float']
  position: Scalars['Float']
  status: PlayerStateStatus
  updatedAt: Scalars['NaiveDateTime']
}

export type PlayerStateConnection = {
  __typename?: 'PlayerStateConnection'
  edges?: Maybe<Array<Maybe<PlayerStateEdge>>>
  pageInfo: PageInfo
}

export type PlayerStateEdge = {
  __typename?: 'PlayerStateEdge'
  cursor?: Maybe<Scalars['String']>
  node?: Maybe<PlayerState>
}

export enum PlayerStateStatus {
  Finished = 'FINISHED',
  InProgress = 'IN_PROGRESS',
  NotStarted = 'NOT_STARTED'
}

export type RootMutationType = {
  __typename?: 'RootMutationType'
  createSession?: Maybe<CreateSessionPayload>
  deleteSession?: Maybe<DeleteSessionPayload>
  updatePlayerState?: Maybe<UpdatePlayerStatePayload>
}

export type RootMutationTypeCreateSessionArgs = {
  input: CreateSessionInput
}

export type RootMutationTypeUpdatePlayerStateArgs = {
  input: UpdatePlayerStateInput
}

export type RootQueryType = {
  __typename?: 'RootQueryType'
  books?: Maybe<BookConnection>
  me?: Maybe<User>
  node?: Maybe<Node>
  playerStates?: Maybe<PlayerStateConnection>
}

export type RootQueryTypeBooksArgs = {
  after?: InputMaybe<Scalars['String']>
  before?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Int']>
  last?: InputMaybe<Scalars['Int']>
}

export type RootQueryTypeNodeArgs = {
  id: Scalars['ID']
}

export type RootQueryTypePlayerStatesArgs = {
  after?: InputMaybe<Scalars['String']>
  before?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Int']>
  last?: InputMaybe<Scalars['Int']>
}

export type Series = Node & {
  __typename?: 'Series'
  /** The ID of an object */
  id: Scalars['ID']
  insertedAt: Scalars['NaiveDateTime']
  name: Scalars['String']
  seriesBooks?: Maybe<SeriesBookConnection>
  updatedAt: Scalars['NaiveDateTime']
}

export type SeriesSeriesBooksArgs = {
  after?: InputMaybe<Scalars['String']>
  before?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Int']>
  last?: InputMaybe<Scalars['Int']>
}

export type SeriesBook = Node & {
  __typename?: 'SeriesBook'
  book: Book
  bookNumber: Scalars['Decimal']
  /** The ID of an object */
  id: Scalars['ID']
  series: Series
}

export type SeriesBookConnection = {
  __typename?: 'SeriesBookConnection'
  edges?: Maybe<Array<Maybe<SeriesBookEdge>>>
  pageInfo: PageInfo
}

export type SeriesBookEdge = {
  __typename?: 'SeriesBookEdge'
  cursor?: Maybe<Scalars['String']>
  node?: Maybe<SeriesBook>
}

export type UpdatePlayerStateInput = {
  mediaId: Scalars['ID']
  playbackRate?: InputMaybe<Scalars['Float']>
  position?: InputMaybe<Scalars['Float']>
}

export type UpdatePlayerStatePayload = {
  __typename?: 'UpdatePlayerStatePayload'
  playerState: PlayerState
}

export type User = {
  __typename?: 'User'
  admin: Scalars['Boolean']
  confirmedAt?: Maybe<Scalars['NaiveDateTime']>
  email: Scalars['String']
  insertedAt: Scalars['NaiveDateTime']
  loadedPlayerState?: Maybe<PlayerState>
  updatedAt: Scalars['NaiveDateTime']
}

export type AuthorBasicsFragment = {
  __typename?: 'Author'
  id: string
  name: string
}

export type NarratorBasicsFragment = {
  __typename?: 'Narrator'
  id: string
  name: string
}

export type PersonBasicsFragment = {
  __typename?: 'Person'
  id: string
  name: string
  imagePath?: string | null
}

export type SeriesBasicsFragment = {
  __typename?: 'Series'
  id: string
  name: string
}

export type SeriesBookBasicsFragment = {
  __typename?: 'SeriesBook'
  id: string
  bookNumber: any
}

export type BookBasicsFragment = {
  __typename?: 'Book'
  id: string
  title: string
  imagePath?: string | null
}

export type BookWithAuthorsAndSeriesFragment = {
  __typename?: 'Book'
  id: string
  title: string
  imagePath?: string | null
  authors: Array<{
    __typename?: 'Author'
    id: string
    name: string
    person: { __typename?: 'Person'; id: string }
  }>
  seriesBooks: Array<{
    __typename?: 'SeriesBook'
    id: string
    bookNumber: any
    series: { __typename?: 'Series'; id: string; name: string }
  }>
}

export type MediaBasicsFragment = {
  __typename?: 'Media'
  id: string
  fullCast: boolean
  abridged: boolean
  duration?: number | null
}

export type MediaWithNarratorsFragment = {
  __typename?: 'Media'
  id: string
  fullCast: boolean
  abridged: boolean
  duration?: number | null
  narrators: Array<{
    __typename?: 'Narrator'
    id: string
    name: string
    person: { __typename?: 'Person'; id: string }
  }>
}

export type PlayerStateBasicsFragment = {
  __typename?: 'PlayerState'
  status: PlayerStateStatus
  position: number
  playbackRate: number
}

export type BooksQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>
  after?: InputMaybe<Scalars['String']>
}>

export type BooksQuery = {
  __typename?: 'RootQueryType'
  books?: {
    __typename?: 'BookConnection'
    edges?: Array<{
      __typename?: 'BookEdge'
      node?: {
        __typename?: 'Book'
        id: string
        title: string
        imagePath?: string | null
        authors: Array<{
          __typename?: 'Author'
          id: string
          name: string
          person: { __typename?: 'Person'; id: string }
        }>
        seriesBooks: Array<{
          __typename?: 'SeriesBook'
          id: string
          bookNumber: any
          series: { __typename?: 'Series'; id: string; name: string }
        }>
      } | null
    } | null> | null
    pageInfo: {
      __typename?: 'PageInfo'
      hasNextPage: boolean
      endCursor?: string | null
    }
  } | null
}

export type BookQueryVariables = Exact<{
  id: Scalars['ID']
}>

export type BookQuery = {
  __typename?: 'RootQueryType'
  node?:
    | { __typename?: 'Author' }
    | {
        __typename?: 'Book'
        published: any
        description?: string | null
        id: string
        title: string
        imagePath?: string | null
        media: Array<{
          __typename?: 'Media'
          id: string
          fullCast: boolean
          abridged: boolean
          duration?: number | null
          narrators: Array<{
            __typename?: 'Narrator'
            id: string
            name: string
            person: { __typename?: 'Person'; id: string }
          }>
        }>
        authors: Array<{
          __typename?: 'Author'
          id: string
          name: string
          person: { __typename?: 'Person'; id: string }
        }>
        seriesBooks: Array<{
          __typename?: 'SeriesBook'
          id: string
          bookNumber: any
          series: { __typename?: 'Series'; id: string; name: string }
        }>
      }
    | { __typename?: 'Media' }
    | { __typename?: 'Narrator' }
    | { __typename?: 'Person' }
    | { __typename?: 'PlayerState' }
    | { __typename?: 'Series' }
    | { __typename?: 'SeriesBook' }
    | null
}

export type SeriesQueryVariables = Exact<{
  id: Scalars['ID']
}>

export type SeriesQuery = {
  __typename?: 'RootQueryType'
  node?:
    | { __typename?: 'Author' }
    | { __typename?: 'Book' }
    | { __typename?: 'Media' }
    | { __typename?: 'Narrator' }
    | { __typename?: 'Person' }
    | { __typename?: 'PlayerState' }
    | { __typename?: 'Series'; id: string; name: string }
    | { __typename?: 'SeriesBook' }
    | null
}

export type PersonQueryVariables = Exact<{
  id: Scalars['ID']
  previewBooks: Scalars['Int']
}>

export type PersonQuery = {
  __typename?: 'RootQueryType'
  node?:
    | { __typename?: 'Author' }
    | { __typename?: 'Book' }
    | { __typename?: 'Media' }
    | { __typename?: 'Narrator' }
    | {
        __typename?: 'Person'
        description?: string | null
        id: string
        name: string
        imagePath?: string | null
        authors: Array<{
          __typename?: 'Author'
          id: string
          name: string
          authoredBooks?: {
            __typename?: 'BookConnection'
            edges?: Array<{
              __typename?: 'BookEdge'
              node?: {
                __typename?: 'Book'
                id: string
                title: string
                imagePath?: string | null
                authors: Array<{
                  __typename?: 'Author'
                  id: string
                  name: string
                  person: { __typename?: 'Person'; id: string }
                }>
                seriesBooks: Array<{
                  __typename?: 'SeriesBook'
                  id: string
                  bookNumber: any
                  series: { __typename?: 'Series'; id: string; name: string }
                }>
              } | null
            } | null> | null
            pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean }
          } | null
        }>
        narrators: Array<{
          __typename?: 'Narrator'
          id: string
          name: string
          narratedMedia?: {
            __typename?: 'MediaConnection'
            edges?: Array<{
              __typename?: 'MediaEdge'
              node?: {
                __typename?: 'Media'
                book: {
                  __typename?: 'Book'
                  id: string
                  title: string
                  imagePath?: string | null
                  authors: Array<{
                    __typename?: 'Author'
                    id: string
                    name: string
                    person: { __typename?: 'Person'; id: string }
                  }>
                  seriesBooks: Array<{
                    __typename?: 'SeriesBook'
                    id: string
                    bookNumber: any
                    series: { __typename?: 'Series'; id: string; name: string }
                  }>
                }
              } | null
            } | null> | null
            pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean }
          } | null
        }>
      }
    | { __typename?: 'PlayerState' }
    | { __typename?: 'Series' }
    | { __typename?: 'SeriesBook' }
    | null
}

export type AuthoredBooksQueryVariables = Exact<{
  id: Scalars['ID']
  first?: InputMaybe<Scalars['Int']>
  after?: InputMaybe<Scalars['String']>
}>

export type AuthoredBooksQuery = {
  __typename?: 'RootQueryType'
  node?:
    | {
        __typename?: 'Author'
        authoredBooks?: {
          __typename?: 'BookConnection'
          edges?: Array<{
            __typename?: 'BookEdge'
            node?: {
              __typename?: 'Book'
              id: string
              title: string
              imagePath?: string | null
              authors: Array<{
                __typename?: 'Author'
                id: string
                name: string
                person: { __typename?: 'Person'; id: string }
              }>
              seriesBooks: Array<{
                __typename?: 'SeriesBook'
                id: string
                bookNumber: any
                series: { __typename?: 'Series'; id: string; name: string }
              }>
            } | null
          } | null> | null
          pageInfo: {
            __typename?: 'PageInfo'
            hasNextPage: boolean
            endCursor?: string | null
          }
        } | null
      }
    | { __typename?: 'Book' }
    | { __typename?: 'Media' }
    | { __typename?: 'Narrator' }
    | { __typename?: 'Person' }
    | { __typename?: 'PlayerState' }
    | { __typename?: 'Series' }
    | { __typename?: 'SeriesBook' }
    | null
}

export type NarratedMediaQueryVariables = Exact<{
  id: Scalars['ID']
  first?: InputMaybe<Scalars['Int']>
  after?: InputMaybe<Scalars['String']>
}>

export type NarratedMediaQuery = {
  __typename?: 'RootQueryType'
  node?:
    | { __typename?: 'Author' }
    | { __typename?: 'Book' }
    | { __typename?: 'Media' }
    | {
        __typename?: 'Narrator'
        narratedMedia?: {
          __typename?: 'MediaConnection'
          edges?: Array<{
            __typename?: 'MediaEdge'
            node?: {
              __typename?: 'Media'
              book: {
                __typename?: 'Book'
                id: string
                title: string
                imagePath?: string | null
                authors: Array<{
                  __typename?: 'Author'
                  id: string
                  name: string
                  person: { __typename?: 'Person'; id: string }
                }>
                seriesBooks: Array<{
                  __typename?: 'SeriesBook'
                  id: string
                  bookNumber: any
                  series: { __typename?: 'Series'; id: string; name: string }
                }>
              }
            } | null
          } | null> | null
          pageInfo: {
            __typename?: 'PageInfo'
            hasNextPage: boolean
            endCursor?: string | null
          }
        } | null
      }
    | { __typename?: 'Person' }
    | { __typename?: 'PlayerState' }
    | { __typename?: 'Series' }
    | { __typename?: 'SeriesBook' }
    | null
}

export type SeriesBooksQueryVariables = Exact<{
  id: Scalars['ID']
  first?: InputMaybe<Scalars['Int']>
  after?: InputMaybe<Scalars['String']>
}>

export type SeriesBooksQuery = {
  __typename?: 'RootQueryType'
  node?:
    | { __typename?: 'Author' }
    | { __typename?: 'Book' }
    | { __typename?: 'Media' }
    | { __typename?: 'Narrator' }
    | { __typename?: 'Person' }
    | { __typename?: 'PlayerState' }
    | {
        __typename?: 'Series'
        seriesBooks?: {
          __typename?: 'SeriesBookConnection'
          edges?: Array<{
            __typename?: 'SeriesBookEdge'
            node?: {
              __typename?: 'SeriesBook'
              id: string
              bookNumber: any
              book: {
                __typename?: 'Book'
                id: string
                title: string
                imagePath?: string | null
                authors: Array<{
                  __typename?: 'Author'
                  id: string
                  name: string
                  person: { __typename?: 'Person'; id: string }
                }>
                seriesBooks: Array<{
                  __typename?: 'SeriesBook'
                  id: string
                  bookNumber: any
                  series: { __typename?: 'Series'; id: string; name: string }
                }>
              }
            } | null
          } | null> | null
          pageInfo: {
            __typename?: 'PageInfo'
            hasNextPage: boolean
            endCursor?: string | null
          }
        } | null
      }
    | { __typename?: 'SeriesBook' }
    | null
}

export type PlayerStatesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>
  after?: InputMaybe<Scalars['String']>
}>

export type PlayerStatesQuery = {
  __typename?: 'RootQueryType'
  playerStates?: {
    __typename?: 'PlayerStateConnection'
    edges?: Array<{
      __typename?: 'PlayerStateEdge'
      node?: {
        __typename?: 'PlayerState'
        status: PlayerStateStatus
        position: number
        playbackRate: number
        media: {
          __typename?: 'Media'
          id: string
          fullCast: boolean
          abridged: boolean
          duration?: number | null
          book: {
            __typename?: 'Book'
            id: string
            title: string
            imagePath?: string | null
            authors: Array<{
              __typename?: 'Author'
              id: string
              name: string
              person: { __typename?: 'Person'; id: string }
            }>
            seriesBooks: Array<{
              __typename?: 'SeriesBook'
              id: string
              bookNumber: any
              series: { __typename?: 'Series'; id: string; name: string }
            }>
          }
        }
      } | null
    } | null> | null
    pageInfo: {
      __typename?: 'PageInfo'
      hasNextPage: boolean
      endCursor?: string | null
    }
  } | null
}

export type MediaWithPlayerStateQueryVariables = Exact<{
  id: Scalars['ID']
}>

export type MediaWithPlayerStateQuery = {
  __typename?: 'RootQueryType'
  node?:
    | { __typename?: 'Author' }
    | { __typename?: 'Book' }
    | {
        __typename?: 'Media'
        hlsPath?: string | null
        mpdPath?: string | null
        id: string
        fullCast: boolean
        abridged: boolean
        duration?: number | null
        chapters: Array<{
          __typename?: 'Chapter'
          id: string
          startTime: number
          endTime?: number | null
          title?: string | null
        }>
        book: {
          __typename?: 'Book'
          id: string
          title: string
          imagePath?: string | null
          authors: Array<{
            __typename?: 'Author'
            id: string
            name: string
            person: { __typename?: 'Person'; id: string }
          }>
          seriesBooks: Array<{
            __typename?: 'SeriesBook'
            id: string
            bookNumber: any
            series: { __typename?: 'Series'; id: string; name: string }
          }>
        }
        playerState?: {
          __typename?: 'PlayerState'
          status: PlayerStateStatus
          position: number
          playbackRate: number
        } | null
        narrators: Array<{
          __typename?: 'Narrator'
          id: string
          name: string
          person: { __typename?: 'Person'; id: string }
        }>
      }
    | { __typename?: 'Narrator' }
    | { __typename?: 'Person' }
    | { __typename?: 'PlayerState' }
    | { __typename?: 'Series' }
    | { __typename?: 'SeriesBook' }
    | null
}

export type LoginMutationVariables = Exact<{
  input: CreateSessionInput
}>

export type LoginMutation = {
  __typename?: 'RootMutationType'
  login?: {
    __typename?: 'CreateSessionPayload'
    token: string
    user: { __typename?: 'User'; email: string }
  } | null
}

export type LogoutMutationVariables = Exact<{ [key: string]: never }>

export type LogoutMutation = {
  __typename?: 'RootMutationType'
  logout?: { __typename?: 'DeleteSessionPayload'; deleted: boolean } | null
}

export type UpdatePlayerStateMutationVariables = Exact<{
  input: UpdatePlayerStateInput
}>

export type UpdatePlayerStateMutation = {
  __typename?: 'RootMutationType'
  updatePlayerState?: {
    __typename?: 'UpdatePlayerStatePayload'
    playerState: {
      __typename?: 'PlayerState'
      status: PlayerStateStatus
      position: number
      playbackRate: number
    }
  } | null
}

export const PersonBasicsFragmentDoc = `
    fragment PersonBasics on Person {
  id
  name
  imagePath
}
    `
export const BookBasicsFragmentDoc = `
    fragment BookBasics on Book {
  id
  title
  imagePath
}
    `
export const AuthorBasicsFragmentDoc = `
    fragment AuthorBasics on Author {
  id
  name
}
    `
export const SeriesBookBasicsFragmentDoc = `
    fragment SeriesBookBasics on SeriesBook {
  id
  bookNumber
}
    `
export const SeriesBasicsFragmentDoc = `
    fragment SeriesBasics on Series {
  id
  name
}
    `
export const BookWithAuthorsAndSeriesFragmentDoc = `
    fragment BookWithAuthorsAndSeries on Book {
  ...BookBasics
  authors {
    ...AuthorBasics
    person {
      id
    }
  }
  seriesBooks {
    ...SeriesBookBasics
    series {
      ...SeriesBasics
    }
  }
}
    ${BookBasicsFragmentDoc}
${AuthorBasicsFragmentDoc}
${SeriesBookBasicsFragmentDoc}
${SeriesBasicsFragmentDoc}`
export const MediaBasicsFragmentDoc = `
    fragment MediaBasics on Media {
  id
  fullCast
  abridged
  duration
}
    `
export const NarratorBasicsFragmentDoc = `
    fragment NarratorBasics on Narrator {
  id
  name
}
    `
export const MediaWithNarratorsFragmentDoc = `
    fragment MediaWithNarrators on Media {
  ...MediaBasics
  narrators {
    ...NarratorBasics
    person {
      id
    }
  }
}
    ${MediaBasicsFragmentDoc}
${NarratorBasicsFragmentDoc}`
export const PlayerStateBasicsFragmentDoc = `
    fragment PlayerStateBasics on PlayerState {
  status
  position
  playbackRate
}
    `
export const BooksDocument = `
    query books($first: Int, $after: String) {
  books(first: $first, after: $after) {
    edges {
      node {
        ...BookWithAuthorsAndSeries
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    ${BookWithAuthorsAndSeriesFragmentDoc}`
export const useBooksQuery = <TData = BooksQuery, TError = unknown>(
  client: GraphQLClient,
  variables?: BooksQueryVariables,
  options?: UseQueryOptions<BooksQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useQuery<BooksQuery, TError, TData>(
    variables === undefined ? ['books'] : ['books', variables],
    fetcher<BooksQuery, BooksQueryVariables>(
      client,
      BooksDocument,
      variables,
      headers
    ),
    options
  )
export const useInfiniteBooksQuery = <TData = BooksQuery, TError = unknown>(
  _pageParamKey: keyof BooksQueryVariables,
  client: GraphQLClient,
  variables?: BooksQueryVariables,
  options?: UseInfiniteQueryOptions<BooksQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useInfiniteQuery<BooksQuery, TError, TData>(
    variables === undefined
      ? ['books.infinite']
      : ['books.infinite', variables],
    metaData =>
      fetcher<BooksQuery, BooksQueryVariables>(
        client,
        BooksDocument,
        { ...variables, ...(metaData.pageParam ?? {}) },
        headers
      )(),
    options
  )

export const BookDocument = `
    query book($id: ID!) {
  node(id: $id) {
    ... on Book {
      ...BookWithAuthorsAndSeries
      published
      description
      media {
        ...MediaWithNarrators
      }
    }
  }
}
    ${BookWithAuthorsAndSeriesFragmentDoc}
${MediaWithNarratorsFragmentDoc}`
export const useBookQuery = <TData = BookQuery, TError = unknown>(
  client: GraphQLClient,
  variables: BookQueryVariables,
  options?: UseQueryOptions<BookQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useQuery<BookQuery, TError, TData>(
    ['book', variables],
    fetcher<BookQuery, BookQueryVariables>(
      client,
      BookDocument,
      variables,
      headers
    ),
    options
  )
export const useInfiniteBookQuery = <TData = BookQuery, TError = unknown>(
  _pageParamKey: keyof BookQueryVariables,
  client: GraphQLClient,
  variables: BookQueryVariables,
  options?: UseInfiniteQueryOptions<BookQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useInfiniteQuery<BookQuery, TError, TData>(
    ['book.infinite', variables],
    metaData =>
      fetcher<BookQuery, BookQueryVariables>(
        client,
        BookDocument,
        { ...variables, ...(metaData.pageParam ?? {}) },
        headers
      )(),
    options
  )

export const SeriesDocument = `
    query series($id: ID!) {
  node(id: $id) {
    ... on Series {
      ...SeriesBasics
    }
  }
}
    ${SeriesBasicsFragmentDoc}`
export const useSeriesQuery = <TData = SeriesQuery, TError = unknown>(
  client: GraphQLClient,
  variables: SeriesQueryVariables,
  options?: UseQueryOptions<SeriesQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useQuery<SeriesQuery, TError, TData>(
    ['series', variables],
    fetcher<SeriesQuery, SeriesQueryVariables>(
      client,
      SeriesDocument,
      variables,
      headers
    ),
    options
  )
export const useInfiniteSeriesQuery = <TData = SeriesQuery, TError = unknown>(
  _pageParamKey: keyof SeriesQueryVariables,
  client: GraphQLClient,
  variables: SeriesQueryVariables,
  options?: UseInfiniteQueryOptions<SeriesQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useInfiniteQuery<SeriesQuery, TError, TData>(
    ['series.infinite', variables],
    metaData =>
      fetcher<SeriesQuery, SeriesQueryVariables>(
        client,
        SeriesDocument,
        { ...variables, ...(metaData.pageParam ?? {}) },
        headers
      )(),
    options
  )

export const PersonDocument = `
    query person($id: ID!, $previewBooks: Int!) {
  node(id: $id) {
    ... on Person {
      ...PersonBasics
      description
      authors {
        ...AuthorBasics
        authoredBooks(first: $previewBooks) {
          edges {
            node {
              ...BookWithAuthorsAndSeries
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
      narrators {
        ...NarratorBasics
        narratedMedia(first: $previewBooks) {
          edges {
            node {
              book {
                ...BookWithAuthorsAndSeries
              }
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    }
  }
}
    ${PersonBasicsFragmentDoc}
${AuthorBasicsFragmentDoc}
${BookWithAuthorsAndSeriesFragmentDoc}
${NarratorBasicsFragmentDoc}`
export const usePersonQuery = <TData = PersonQuery, TError = unknown>(
  client: GraphQLClient,
  variables: PersonQueryVariables,
  options?: UseQueryOptions<PersonQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useQuery<PersonQuery, TError, TData>(
    ['person', variables],
    fetcher<PersonQuery, PersonQueryVariables>(
      client,
      PersonDocument,
      variables,
      headers
    ),
    options
  )
export const useInfinitePersonQuery = <TData = PersonQuery, TError = unknown>(
  _pageParamKey: keyof PersonQueryVariables,
  client: GraphQLClient,
  variables: PersonQueryVariables,
  options?: UseInfiniteQueryOptions<PersonQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useInfiniteQuery<PersonQuery, TError, TData>(
    ['person.infinite', variables],
    metaData =>
      fetcher<PersonQuery, PersonQueryVariables>(
        client,
        PersonDocument,
        { ...variables, ...(metaData.pageParam ?? {}) },
        headers
      )(),
    options
  )

export const AuthoredBooksDocument = `
    query authoredBooks($id: ID!, $first: Int, $after: String) {
  node(id: $id) {
    ... on Author {
      authoredBooks(first: $first, after: $after) {
        edges {
          node {
            ...BookWithAuthorsAndSeries
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
}
    ${BookWithAuthorsAndSeriesFragmentDoc}`
export const useAuthoredBooksQuery = <
  TData = AuthoredBooksQuery,
  TError = unknown
>(
  client: GraphQLClient,
  variables: AuthoredBooksQueryVariables,
  options?: UseQueryOptions<AuthoredBooksQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useQuery<AuthoredBooksQuery, TError, TData>(
    ['authoredBooks', variables],
    fetcher<AuthoredBooksQuery, AuthoredBooksQueryVariables>(
      client,
      AuthoredBooksDocument,
      variables,
      headers
    ),
    options
  )
export const useInfiniteAuthoredBooksQuery = <
  TData = AuthoredBooksQuery,
  TError = unknown
>(
  _pageParamKey: keyof AuthoredBooksQueryVariables,
  client: GraphQLClient,
  variables: AuthoredBooksQueryVariables,
  options?: UseInfiniteQueryOptions<AuthoredBooksQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useInfiniteQuery<AuthoredBooksQuery, TError, TData>(
    ['authoredBooks.infinite', variables],
    metaData =>
      fetcher<AuthoredBooksQuery, AuthoredBooksQueryVariables>(
        client,
        AuthoredBooksDocument,
        { ...variables, ...(metaData.pageParam ?? {}) },
        headers
      )(),
    options
  )

export const NarratedMediaDocument = `
    query narratedMedia($id: ID!, $first: Int, $after: String) {
  node(id: $id) {
    ... on Narrator {
      narratedMedia(first: $first, after: $after) {
        edges {
          node {
            book {
              ...BookWithAuthorsAndSeries
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
}
    ${BookWithAuthorsAndSeriesFragmentDoc}`
export const useNarratedMediaQuery = <
  TData = NarratedMediaQuery,
  TError = unknown
>(
  client: GraphQLClient,
  variables: NarratedMediaQueryVariables,
  options?: UseQueryOptions<NarratedMediaQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useQuery<NarratedMediaQuery, TError, TData>(
    ['narratedMedia', variables],
    fetcher<NarratedMediaQuery, NarratedMediaQueryVariables>(
      client,
      NarratedMediaDocument,
      variables,
      headers
    ),
    options
  )
export const useInfiniteNarratedMediaQuery = <
  TData = NarratedMediaQuery,
  TError = unknown
>(
  _pageParamKey: keyof NarratedMediaQueryVariables,
  client: GraphQLClient,
  variables: NarratedMediaQueryVariables,
  options?: UseInfiniteQueryOptions<NarratedMediaQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useInfiniteQuery<NarratedMediaQuery, TError, TData>(
    ['narratedMedia.infinite', variables],
    metaData =>
      fetcher<NarratedMediaQuery, NarratedMediaQueryVariables>(
        client,
        NarratedMediaDocument,
        { ...variables, ...(metaData.pageParam ?? {}) },
        headers
      )(),
    options
  )

export const SeriesBooksDocument = `
    query seriesBooks($id: ID!, $first: Int, $after: String) {
  node(id: $id) {
    ... on Series {
      seriesBooks(first: $first, after: $after) {
        edges {
          node {
            ...SeriesBookBasics
            book {
              ...BookWithAuthorsAndSeries
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
}
    ${SeriesBookBasicsFragmentDoc}
${BookWithAuthorsAndSeriesFragmentDoc}`
export const useSeriesBooksQuery = <TData = SeriesBooksQuery, TError = unknown>(
  client: GraphQLClient,
  variables: SeriesBooksQueryVariables,
  options?: UseQueryOptions<SeriesBooksQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useQuery<SeriesBooksQuery, TError, TData>(
    ['seriesBooks', variables],
    fetcher<SeriesBooksQuery, SeriesBooksQueryVariables>(
      client,
      SeriesBooksDocument,
      variables,
      headers
    ),
    options
  )
export const useInfiniteSeriesBooksQuery = <
  TData = SeriesBooksQuery,
  TError = unknown
>(
  _pageParamKey: keyof SeriesBooksQueryVariables,
  client: GraphQLClient,
  variables: SeriesBooksQueryVariables,
  options?: UseInfiniteQueryOptions<SeriesBooksQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useInfiniteQuery<SeriesBooksQuery, TError, TData>(
    ['seriesBooks.infinite', variables],
    metaData =>
      fetcher<SeriesBooksQuery, SeriesBooksQueryVariables>(
        client,
        SeriesBooksDocument,
        { ...variables, ...(metaData.pageParam ?? {}) },
        headers
      )(),
    options
  )

export const PlayerStatesDocument = `
    query playerStates($first: Int, $after: String) {
  playerStates(first: $first, after: $after) {
    edges {
      node {
        ...PlayerStateBasics
        media {
          ...MediaBasics
          book {
            ...BookWithAuthorsAndSeries
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    ${PlayerStateBasicsFragmentDoc}
${MediaBasicsFragmentDoc}
${BookWithAuthorsAndSeriesFragmentDoc}`
export const usePlayerStatesQuery = <
  TData = PlayerStatesQuery,
  TError = unknown
>(
  client: GraphQLClient,
  variables?: PlayerStatesQueryVariables,
  options?: UseQueryOptions<PlayerStatesQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useQuery<PlayerStatesQuery, TError, TData>(
    variables === undefined ? ['playerStates'] : ['playerStates', variables],
    fetcher<PlayerStatesQuery, PlayerStatesQueryVariables>(
      client,
      PlayerStatesDocument,
      variables,
      headers
    ),
    options
  )
export const useInfinitePlayerStatesQuery = <
  TData = PlayerStatesQuery,
  TError = unknown
>(
  _pageParamKey: keyof PlayerStatesQueryVariables,
  client: GraphQLClient,
  variables?: PlayerStatesQueryVariables,
  options?: UseInfiniteQueryOptions<PlayerStatesQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useInfiniteQuery<PlayerStatesQuery, TError, TData>(
    variables === undefined
      ? ['playerStates.infinite']
      : ['playerStates.infinite', variables],
    metaData =>
      fetcher<PlayerStatesQuery, PlayerStatesQueryVariables>(
        client,
        PlayerStatesDocument,
        { ...variables, ...(metaData.pageParam ?? {}) },
        headers
      )(),
    options
  )

export const MediaWithPlayerStateDocument = `
    query mediaWithPlayerState($id: ID!) {
  node(id: $id) {
    ... on Media {
      ...MediaWithNarrators
      hlsPath
      mpdPath
      chapters {
        id
        startTime
        endTime
        title
      }
      book {
        ...BookWithAuthorsAndSeries
      }
      playerState {
        ...PlayerStateBasics
      }
    }
  }
}
    ${MediaWithNarratorsFragmentDoc}
${BookWithAuthorsAndSeriesFragmentDoc}
${PlayerStateBasicsFragmentDoc}`
export const useMediaWithPlayerStateQuery = <
  TData = MediaWithPlayerStateQuery,
  TError = unknown
>(
  client: GraphQLClient,
  variables: MediaWithPlayerStateQueryVariables,
  options?: UseQueryOptions<MediaWithPlayerStateQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useQuery<MediaWithPlayerStateQuery, TError, TData>(
    ['mediaWithPlayerState', variables],
    fetcher<MediaWithPlayerStateQuery, MediaWithPlayerStateQueryVariables>(
      client,
      MediaWithPlayerStateDocument,
      variables,
      headers
    ),
    options
  )
export const useInfiniteMediaWithPlayerStateQuery = <
  TData = MediaWithPlayerStateQuery,
  TError = unknown
>(
  _pageParamKey: keyof MediaWithPlayerStateQueryVariables,
  client: GraphQLClient,
  variables: MediaWithPlayerStateQueryVariables,
  options?: UseInfiniteQueryOptions<MediaWithPlayerStateQuery, TError, TData>,
  headers?: RequestInit['headers']
) =>
  useInfiniteQuery<MediaWithPlayerStateQuery, TError, TData>(
    ['mediaWithPlayerState.infinite', variables],
    metaData =>
      fetcher<MediaWithPlayerStateQuery, MediaWithPlayerStateQueryVariables>(
        client,
        MediaWithPlayerStateDocument,
        { ...variables, ...(metaData.pageParam ?? {}) },
        headers
      )(),
    options
  )

export const LoginDocument = `
    mutation login($input: CreateSessionInput!) {
  login: createSession(input: $input) {
    token
    user {
      email
    }
  }
}
    `
export const useLoginMutation = <TError = unknown, TContext = unknown>(
  client: GraphQLClient,
  options?: UseMutationOptions<
    LoginMutation,
    TError,
    LoginMutationVariables,
    TContext
  >,
  headers?: RequestInit['headers']
) =>
  useMutation<LoginMutation, TError, LoginMutationVariables, TContext>(
    ['login'],
    (variables?: LoginMutationVariables) =>
      fetcher<LoginMutation, LoginMutationVariables>(
        client,
        LoginDocument,
        variables,
        headers
      )(),
    options
  )
export const LogoutDocument = `
    mutation logout {
  logout: deleteSession {
    deleted
  }
}
    `
export const useLogoutMutation = <TError = unknown, TContext = unknown>(
  client: GraphQLClient,
  options?: UseMutationOptions<
    LogoutMutation,
    TError,
    LogoutMutationVariables,
    TContext
  >,
  headers?: RequestInit['headers']
) =>
  useMutation<LogoutMutation, TError, LogoutMutationVariables, TContext>(
    ['logout'],
    (variables?: LogoutMutationVariables) =>
      fetcher<LogoutMutation, LogoutMutationVariables>(
        client,
        LogoutDocument,
        variables,
        headers
      )(),
    options
  )
export const UpdatePlayerStateDocument = `
    mutation updatePlayerState($input: UpdatePlayerStateInput!) {
  updatePlayerState(input: $input) {
    playerState {
      ...PlayerStateBasics
    }
  }
}
    ${PlayerStateBasicsFragmentDoc}`
export const useUpdatePlayerStateMutation = <
  TError = unknown,
  TContext = unknown
>(
  client: GraphQLClient,
  options?: UseMutationOptions<
    UpdatePlayerStateMutation,
    TError,
    UpdatePlayerStateMutationVariables,
    TContext
  >,
  headers?: RequestInit['headers']
) =>
  useMutation<
    UpdatePlayerStateMutation,
    TError,
    UpdatePlayerStateMutationVariables,
    TContext
  >(
    ['updatePlayerState'],
    (variables?: UpdatePlayerStateMutationVariables) =>
      fetcher<UpdatePlayerStateMutation, UpdatePlayerStateMutationVariables>(
        client,
        UpdatePlayerStateDocument,
        variables,
        headers
      )(),
    options
  )
