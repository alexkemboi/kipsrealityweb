import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CategoryFormData } from '../../type';

interface CategoryModalProps {
  isOpen: boolean;
  categoryForm: CategoryFormData;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: keyof CategoryFormData, value: string) => void;
}

export default function CategoryModal({
  isOpen,
  categoryForm,
  onClose,
  onSave,
  onChange,
}: CategoryModalProps) {
  const presetColors = [
    '#03346E', '#2196F3', '#4CAF50', '#FF9800', 
    '#F44336', '#9C27B0', '#00BCD4', '#FF5722'
  ];

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2,
        fontWeight: 700,
      }}>
        {categoryForm.id ? "Edit Category" : "Add Category"}
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            label="Name"
            placeholder="Enter category name"
            value={categoryForm.name}
            onChange={(e) => onChange('name', e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Tagline"
            placeholder="Enter category tagline"
            value={categoryForm.tagline}
            onChange={(e) => onChange('tagline', e.target.value)}
            fullWidth
            multiline
            rows={2}
          />

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
              Color
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <input
                type="color"
                value={categoryForm.color}
                onChange={(e) => onChange('color', e.target.value)}
                style={{
                  width: 60,
                  height: 50,
                  border: '2px solid #e0e0e0',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              />
              <TextField
                value={categoryForm.color}
                onChange={(e) => onChange('color', e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
            
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Quick select
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {presetColors.map((color) => (
                <Box
                  key={color}
                  onClick={() => onChange('color', color)}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: color,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: categoryForm.color === color ? '3px solid' : '2px solid',
                    borderColor: categoryForm.color === color ? 'primary.main' : 'grey.300',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit" size="large">
          Cancel
        </Button>
        <Button onClick={onSave} variant="contained" color="primary" size="large">
          Save Category
        </Button>
      </DialogActions>
    </Dialog>
  );
}