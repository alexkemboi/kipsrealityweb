import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Category, Service } from './type';
import ServiceCard from './ServiceCard';

interface CategoryCardProps {
  category: Category;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: number) => void;
  onAddService: (category: Category) => void;
  onEditService: (category: Category, service: Service) => void;
  onDeleteService: (id: number) => void;
}

export default function CategoryCard({
  category,
  onEditCategory,
  onDeleteCategory,
  onAddService,
  onEditService,
  onDeleteService,
}: CategoryCardProps) {
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: 2,
        borderColor: category.color,
        borderRadius: 2,
        transition: 'all 0.2s',
        mx: { xs: 2, sm: 0 }, // Mobile margin
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        }
      }}
    >
      <Box
        sx={{
          bgcolor: `${category.color}15`,
          borderBottom: 3,
          borderColor: category.color,
          p: { xs: 2, sm: 2.5 },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'flex-start' }, 
          gap: { xs: 1.5, sm: 2 }
        }}>
          <Box sx={{ flex: 1, minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
            <Typography 
              variant="h5" 
              component="h2" 
              fontWeight={700}
              sx={{ 
                color: category.color, 
                mb: 0.5,
                fontSize: { xs: '1.1rem', sm: '1.5rem' },
                wordBreak: 'break-word',
              }}
            >
              {category.name}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                lineHeight: 1.5,
                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                wordBreak: 'break-word',
              }}
            >
              {category.tagline}
            </Typography>
          </Box>
          
          <Stack 
            direction="row" 
            spacing={0.5} 
            sx={{ 
              flexShrink: 0,
              alignSelf: { xs: 'flex-end', sm: 'flex-start' }
            }}
          >
            <IconButton 
              size="small" 
              onClick={() => onEditCategory(category)}
              sx={{ 
                color: category.color,
                '&:hover': { bgcolor: `${category.color}20` }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => onDeleteCategory(category.id)}
              color="error"
              sx={{ '&:hover': { bgcolor: 'error.light' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Box>

      <CardContent sx={{ 
        p: { xs: 2, sm: 2.5 }, 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          mb: 2, 
          gap: { xs: 1.5, sm: 1 }
        }}>
          <Typography 
            variant="h6" 
            fontWeight={600} 
            sx={{ 
              fontSize: { xs: '0.95rem', sm: '1.25rem' }
            }}
          >
            Services ({category.services.length})
          </Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onAddService(category)}
            fullWidth={false}
            sx={{ 
              bgcolor: category.color, 
              fontWeight: 600,
              fontSize: { xs: '0.813rem', sm: '0.875rem' },
              px: { xs: 2, sm: 2 },
              py: { xs: 1, sm: 0.5 },
              minWidth: { xs: '100%', sm: 'auto' },
              '&:hover': { 
                bgcolor: category.color, 
                opacity: 0.9,
                transform: 'scale(1.02)',
              } 
            }}
          >
            Add Service
          </Button>
        </Box>

        {category.services.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 3, sm: 4 },
              px: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: 1,
              borderColor: 'grey.200',
              borderStyle: 'dashed',
            }}
          >
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
            >
              No services yet. Add your first service!
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {category.services.map((service: any) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={(srv: any) => onEditService(category, srv)}
                onDelete={onDeleteService}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}