import {
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  Pagination,
  Stack,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { formatMoney } from '../../../shared/utils/money'
import { listMyOrders } from '../api'

export function OrdersPage() {
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: ['orders', page],
    queryFn: () => listMyOrders(page - 1, 8),
  })

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="md">
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h4" fontWeight={900}>
              Orders
            </Typography>
            <Typography color="text.secondary">
              Your recent purchases.
            </Typography>
          </Box>

          {query.isLoading ? (
            <Typography color="text.secondary">Loading…</Typography>
          ) : query.isError ? (
            <Typography color="error">
              {(query.error as Error).message || 'Failed to load orders'}
            </Typography>
          ) : query.data ? (
            <>
              <Stack spacing={2}>
                {query.data.items.map((o) => (
                  <Card key={o.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                          <Typography fontWeight={900}>Order #{o.id}</Typography>
                          <Typography
                            fontWeight={800}
                            color={o.status === 'PAID' ? 'success.main' : 'text.secondary'}
                          >
                            {o.status}
                          </Typography>
                        </Stack>
                        <Typography color="text.secondary" variant="body2">
                          Total: {formatMoney(o.totalAmount, o.currency)}
                        </Typography>
                        <Divider />
                        <Stack spacing={0.5}>
                          {o.items.map((i) => (
                            <Stack key={i.id} direction="row" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">
                                {i.productName} × {i.quantity}
                              </Typography>
                              <Typography variant="body2" fontWeight={700}>
                                {formatMoney(i.lineTotal, o.currency)}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>

              {query.data.totalPages > 1 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
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

