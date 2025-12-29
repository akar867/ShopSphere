import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import {
  Box,
  Container,
  FormControl,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { fetchProducts } from '../api'
import { ProductCard } from '../components/ProductCard'

type SortPreset = 'newest' | 'price_asc' | 'price_desc' | 'name_asc'

function sortParams(preset: SortPreset) {
  switch (preset) {
    case 'price_asc':
      return { sortBy: 'price', direction: 'asc' as const }
    case 'price_desc':
      return { sortBy: 'price', direction: 'desc' as const }
    case 'name_asc':
      return { sortBy: 'name', direction: 'asc' as const }
    case 'newest':
    default:
      return { sortBy: 'createdAt', direction: 'desc' as const }
  }
}

export function ProductListPage() {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1) // UI is 1-based
  const [sort, setSort] = useState<SortPreset>('newest')

  const params = useMemo(
    () => ({
      q: q.trim() || undefined,
      page: page - 1,
      size: 12,
      ...sortParams(sort),
    }),
    [q, page, sort],
  )

  const query = useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
  })

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h4" fontWeight={900}>
              Discover products you’ll love
            </Typography>
            <Typography color="text.secondary">
              Browse, sort, and checkout with a demo payment gateway.
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <TextField
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setPage(1)
              }}
              placeholder="Search products…"
              sx={{ flex: 1, minWidth: 240 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small">
              <Select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortPreset)
                  setPage(1)
                }}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="price_asc">Price: Low → High</MenuItem>
                <MenuItem value="price_desc">Price: High → Low</MenuItem>
                <MenuItem value="name_asc">Name: A → Z</MenuItem>
              </Select>
            </FormControl>
          </Paper>

          {query.isLoading ? (
            <Typography color="text.secondary">Loading products…</Typography>
          ) : query.isError ? (
            <Typography color="error">
              {(query.error as Error).message || 'Failed to load products'}
            </Typography>
          ) : query.data ? (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)',
                  },
                }}
              >
                {query.data.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </Box>

              {query.data.totalPages > 1 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                  <Pagination
                    count={query.data.totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                    shape="rounded"
                  />
                </Box>
              ) : null}
            </>
          ) : null}
        </Stack>
      </Container>
    </Box>
  )
}

