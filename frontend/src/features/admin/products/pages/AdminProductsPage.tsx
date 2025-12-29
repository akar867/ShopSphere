import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminListProducts } from '../api'
import type { Product } from '../api'

export function AdminProductsPage() {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const query = useQuery({
    queryKey: ['admin-products', { q, page, pageSize }],
    queryFn: () =>
      adminListProducts({
        q: q.trim() || undefined,
        page,
        size: pageSize,
        sortBy: 'createdAt',
        direction: 'desc',
      }),
  })

  const rows = query.data?.items ?? []

  const cols = useMemo<GridColDef<Product>[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 90 },
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 220 },
      { field: 'price', headerName: 'Price', width: 120 },
      { field: 'stockQty', headerName: 'Stock', width: 110 },
      { field: 'active', headerName: 'Active', width: 110, type: 'boolean' },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 140,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Button
            size="small"
            startIcon={<EditRoundedIcon />}
            onClick={() => nav(`/admin/products/${params.row.id}/edit`)}
          >
            Edit
          </Button>
        ),
      },
    ],
    [nav],
  )

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={900}>
                Admin • Products
              </Typography>
              <Typography color="text.secondary">
                Create and update products (ADMIN only).
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => nav('/admin/products/new')}
            >
              New product
            </Button>
          </Stack>

          <Paper
            elevation={0}
            sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}
          >
            <TextField
              fullWidth
              placeholder="Search by name…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setPage(0)
              }}
            />
          </Paper>

          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            <DataGrid
              rows={rows}
              columns={cols}
              loading={query.isLoading}
              disableRowSelectionOnClick
              paginationMode="server"
              rowCount={query.data?.totalElements ?? 0}
              pageSizeOptions={[5, 10, 20, 50]}
              paginationModel={{ page, pageSize }}
              onPaginationModelChange={(m) => {
                setPage(m.page)
                setPageSize(m.pageSize)
              }}
              autoHeight
            />
          </Paper>
        </Stack>
      </Container>
    </Box>
  )
}

