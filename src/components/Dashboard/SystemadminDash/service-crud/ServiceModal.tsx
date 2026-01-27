// ServiceModal.tsx
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
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ServiceFormData, Category } from '../../type';

interface ServiceModalProps {
  isOpen: boolean;
  serviceForm: ServiceFormData;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
  onChange: (field: keyof ServiceFormData, value: string | number | string[]) => void;
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
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
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
        {serviceForm.id ? "Edit Service" : "Add Service"}
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
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

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' },
            gap: 2
          }}>
            <Box>
              <TextField
                label="Features"
                placeholder="Enter features (comma separated)"
                value={Array.isArray(serviceForm.features) ? serviceForm.features.join(", ") : serviceForm.features}
                onChange={(e) => onChange('features', e.target.value)}
                fullWidth
              />
              <FormHelperText>Separate multiple features with commas</FormHelperText>
            </Box>

            <TextField
              label="Icon"
              placeholder="Enter icon name or emoji"
              value={serviceForm.icon}
              onChange={(e) => onChange('icon', e.target.value)}
              fullWidth
              inputProps={{ style: { fontSize: '1.5rem', textAlign: 'center' } }}
            />
          </Box>

          <TextField
            label="Impact"
            placeholder="Enter service impact"
            value={serviceForm.impact}
            onChange={(e) => onChange('impact', e.target.value)}
            fullWidth
            multiline
            rows={2}
          />

          <TextField
            select
            label="Category"
            value={serviceForm.categoryId || ''}
            onChange={(e) => onChange('categoryId', Number(e.target.value))}
            fullWidth
            required
          >
            <MenuItem value={0} disabled>
              Select a category
            </MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: c.color }} />
                  {c.name}
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit" size="large">
          Cancel
        </Button>
        <Button onClick={onSave} variant="contained" color="primary" size="large">
          Save Service
        </Button>
      </DialogActions>
    </Dialog>
  );
}
