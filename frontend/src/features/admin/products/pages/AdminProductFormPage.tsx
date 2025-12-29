import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../../shared/api/error'
import { queryClient } from '../../../../app/queryClient'
import { createProduct, getProduct, updateProduct } from '../api'
import type { UpsertProductRequest } from '../api'

export function AdminProductFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const nav = useNavigate()
  const params = useParams()
  const id = mode === 'edit' ? Number(params.id) : null

  const productQuery = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => getProduct(id as number),
    enabled: mode === 'edit' && Number.isFinite(id),
  })

  const initial = useMemo<UpsertProductRequest>(() => {
    if (mode === 'edit' && productQuery.data) {
      const p = productQuery.data
      return {
        name: p.name,
        description: p.description,
        price: p.price,
        stockQty: p.stockQty,
        imageUrl: p.imageUrl,
        active: p.active,
      }
    }
    return {
      name: '',
      description: '',
      price: 0,
      stockQty: 0,
      imageUrl: '',
      active: true,
    }
  }, [mode, productQuery.data])

  const [form, setForm] = useState<UpsertProductRequest>(initial)

  // Keep state in sync once data loads for edit mode.
  if (mode === 'edit' && productQuery.data && form.name === '' && initial.name !== '') {
    setForm(initial)
  }

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === 'create') return createProduct(form)
      return updateProduct(id as number, form)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      nav('/admin/products')
    },
  })

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="md">
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => nav('/admin/products')}>
              Back
            </Button>
            <Box sx={{ flex: 1 }} />
          </Stack>

          <Box>
            <Typography variant="h4" fontWeight={900}>
              {mode === 'create' ? 'Create product' : `Edit product #${id}`}
            </Typography>
            <Typography color="text.secondary">
              This page calls product-service admin endpoints (ADMIN only).
            </Typography>
          </Box>

          {mutation.isError ? (
            <Alert severity="error" sx={{ whiteSpace: 'pre-line' }}>
              {getApiErrorMessage(mutation.error)}
            </Alert>
          ) : null}

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                />
                <TextField
                  label="Description"
                  value={form.description}
                  onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                  multiline
                  minRows={3}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Price"
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value) }))}
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Stock qty"
                    type="number"
                    value={form.stockQty}
                    onChange={(e) => setForm((s) => ({ ...s, stockQty: Number(e.target.value) }))}
                    inputProps={{ min: 0, step: 1 }}
                    sx={{ flex: 1 }}
                  />
                </Stack>
                <TextField
                  label="Image URL"
                  value={form.imageUrl}
                  onChange={(e) => setForm((s) => ({ ...s, imageUrl: e.target.value }))}
                  helperText="Use a direct image URL (for demo)."
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.active}
                      onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))}
                    />
                  }
                  label="Active"
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
                  <Button onClick={() => nav('/admin/products')} disabled={mutation.isPending}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveRoundedIcon />}
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? 'Saving…' : 'Save'}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  )
}

