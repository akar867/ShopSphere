import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography,
} from '@mui/material'
import { formatMoney } from '../../../shared/utils/money'
import { cartStore } from '../../cart/cartStore'
import type { Product } from '../api'

export function ProductCard({ product }: { product: Product }) {
  const add = cartStore((s) => s.add)

  const outOfStock = product.stockQty <= 0

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="190"
          image={product.imageUrl}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        {outOfStock ? (
          <Chip
            label="Out of stock"
            color="default"
            size="small"
            sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'rgba(255,255,255,0.9)' }}
          />
        ) : null}
      </Box>

      <CardContent sx={{ flex: 1 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </Typography>
          <Typography variant="h6" fontWeight={900}>
            {formatMoney(product.price, 'USD')}
          </Typography>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddShoppingCartOutlinedIcon />}
          disabled={outOfStock}
          onClick={() =>
            add(
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
              },
              1,
            )
          }
        >
          Add to cart
        </Button>
      </CardActions>
    </Card>
  )
}

