import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, Box, Typography,
} from '@mui/material';
import { WarningAmber as WarningIcon } from '@mui/icons-material';

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 24px 64px rgba(15,23,42,0.18)',
          border: '1px solid #E2E8F0',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pb: 1,
          fontWeight: 800,
          fontSize: '1.1rem',
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            background: '#BE123C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WarningIcon sx={{ color: '#fff', fontSize: 18 }} />
        </Box>

        <Typography fontWeight={800}>
          {title || 'Confirm Action'}
        </Typography>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ pt: '12px !important' }}>
        <DialogContentText
          sx={{
            color: '#64748B',
            fontSize: '0.9rem',
            lineHeight: 1.6,
          }}
        >
          {message || 'Are you sure you want to proceed?'}
        </DialogContentText>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          gap: 1,
        }}
      >
        <Button
          onClick={onCancel}
          sx={{
            borderRadius: 2.5,
            px: 3,
            bgcolor: '#F1F5F9',
            color: '#64748B',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#E2E8F0',
            },
          }}
        >
          Dismiss
        </Button>

        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            background: '#BE123C',
            boxShadow: 'none',
            transition: 'all 0.2s ease',

            '&:hover': {
              background: '#9F1239',
              boxShadow: '2px 2px 0px 0px #881337',
              transform: 'translate(-1px, -1px)',
            },

            '&:active': {
              transform: 'scale(0.97)',
            },
          }}
        >
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  );
}