import React from 'react';
import { useNavigate } from 'react-router';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

/**
 * 비회원 접근 제한 및 로그인 유도 공통 MUI 모달 컴포넌트
 * @param {boolean} open - 모달 열림 여부
 * @param {function} onClose - 모달 닫기 함수
 * @param {string} title - (선택) 모달 제목
 * @param {string} message - (선택) 모달 안내 메시지
 */
export default function AuthGuardModal({
  open,
  onClose,
  title = '🔒 로그인 필요',
  message = '레시피 등록은 회원 전용 서비스입니다.\n로그인 페이지로 이동하시겠습니까?',
}) {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="auth-guard-dialog-title"
      aria-describedby="auth-guard-dialog-description"
      PaperProps={{
        style: {
          borderRadius: '16px',
          padding: '8px',
          maxWidth: '400px',
          width: '90%',
        },
      }}
    >
      <DialogTitle id="auth-guard-dialog-title" style={{ fontWeight: 700 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="auth-guard-dialog-description" style={{ whitespace: 'pre-line' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions style={{ padding: '16px' }}>
        <Button onClick={onClose} color="inherit">
          취소
        </Button>
        <Button
          onClick={handleGoToLogin}
          variant="contained"
          disableElevation
          style={{
            backgroundColor: 'var(--brand-primary, #f05a24)',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          로그인하러 가기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
