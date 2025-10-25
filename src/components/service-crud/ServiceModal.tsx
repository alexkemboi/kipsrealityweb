import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { ServiceFormData, Category } from '@/components/service-crud/type';

interface ServiceModalProps {
  isOpen: boolean;
  serviceForm: ServiceFormData;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
  onChange: (field: keyof ServiceFormData, value: string | number) => void;
}

export default function ServiceModal({
  isOpen,
  serviceForm,
  categories,
  onClose,
  onSave,
  onChange,
}: ServiceModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {serviceForm.id ? "Edit Service" : "Add Service"}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            label="Name"
            placeholder="Enter service name"
            value={serviceForm.name}
            onChange={(e) => onChange('name', e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Description"
            placeholder="Enter service description"
            value={serviceForm.description}
            onChange={(e) => onChange('description', e.target.value)}
            fullWidth
            multiline
            rows={3}
          />

          <Box>
            <TextField
              label="Features"
              placeholder="Enter features (comma separated)"
              value={serviceForm.features}
              onChange={(e) => onChange('features', e.target.value)}
              fullWidth
            />
            <FormHelperText>Separate multiple features with commas</FormHelperText>
          </Box>

          <TextField
            label="Impact"
            placeholder="Enter service impact"
            value={serviceForm.impact}
            onChange={(e) => onChange('impact', e.target.value)}
            fullWidth
          />

          <TextField
            label="Icon"
            placeholder="Enter icon name or emoji"
            value={serviceForm.icon}
            onChange={(e) => onChange('icon', e.target.value)}
            fullWidth
          />

          <TextField
            select
            label="Category"
            value={serviceForm.category_id || ''}
            onChange={(e) => onChange('category_id', Number(e.target.value))}
            fullWidth
            required
          >
            <MenuItem value={0} disabled>
              Select a category
            </MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onSave} variant="contained" color="primary">
          Save Service
        </Button>
      </DialogActions>
    </Dialog>
  );
}