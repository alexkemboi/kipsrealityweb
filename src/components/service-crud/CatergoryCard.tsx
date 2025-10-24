import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Divider,
  Stack,
  Grid,
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
        border: 2,
        borderColor: category.color,
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        }
      }}
    >
      <Box
        sx={{
          bgcolor: `${category.color}10`,
          borderBottom: 3,
          borderColor: category.color,
          p: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h5" 
              component="h2" 
              fontWeight={700}
              sx={{ color: category.color, mb: 1 }}
            >
              {category.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {category.tagline}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={0.5}>
            <IconButton 
              size="small" 
              onClick={() => onEditCategory(category)}
              sx={{ color: category.color }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => onDeleteCategory(category.id)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Services ({category.services.length})
          </Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onAddService(category)}
            sx={{ bgcolor: category.color, '&:hover': { bgcolor: category.color, opacity: 0.9 } }}
          >
            Add Service
          </Button>
        </Box>

        {category.services.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              px: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: 1,
              borderColor: 'grey.200',
              borderStyle: 'dashed',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No services yet. Add your first service!
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {category.services.map((service: any) => (
                <Grid item xs={12} key={service.id} component="div">
                <ServiceCard
                    service={service}
                    onEdit={(srv: any) => onEditService(category, srv)}
                    onDelete={onDeleteService}
                />
                </Grid>
            ))}
            </Grid>
        )}
      </CardContent>
    </Card>
  );
}