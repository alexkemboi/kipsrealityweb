import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { CategoryFormData } from './type';

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
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {categoryForm.id ? "Edit Category" : "Add Category"}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
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
          />

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Color
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                type="color"
                value={categoryForm.color}
                onChange={(e) => onChange('color', e.target.value)}
                style={{
                  width: 60,
                  height: 40,
                  border: '1px solid #ccc',
                  borderRadius: 4,
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
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onSave} variant="contained" color="primary">
          Save Category
        </Button>
      </DialogActions>
    </Dialog>
  );
}