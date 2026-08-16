import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export default function AccessGuardModal({ isOpen, handleLoadRecentDraft, handleGoToCreatePage }) {
  return (
    <>
      {/* 🚨 잘못된 접근 및 프리셋 없음 통합 MUI 모달 */}
      <Dialog
        open={isAccessModalOpen}
        onClose={handleGoToCreatePage}
        aria-labelledby="access-dialog-title"
        aria-describedby="access-dialog-description"
        PaperProps={{
          style: {
            borderRadius: '16px',
            padding: '12px 8px',
            minWidth: '340px',
            maxWidth: '440px',
          },
        }}
      >
        <DialogTitle id="access-dialog-title" style={{ fontWeight: 600, color: '#333', textAlign: 'center' }}>
          ⚠️ 적용된 레시피 프리셋이 없습니다
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="access-dialog-description"
            style={{ color: '#666', lineHeight: '1.5', textAlign: 'center' }}
          >
            현재 적용 중인 레시피 프리셋 데이터를 찾을 수 없습니다.
            <br />
            <strong>임시 저장해둔 레시피</strong>를 불러오시거나, <strong>새 AI 레시피</strong>를 생성해 주세요.
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ padding: '12px 24px 16px 24px', flexDirection: 'column', gap: '8px' }}>
          {/* 버튼 1: 최근 임시저장 레시피 불러오기 */}
          <Button
            onClick={handleLoadRecentDraft}
            variant="contained"
            disableElevation
            fullWidth
            style={{
              backgroundColor: 'var(--brand-primary, #f05a24)',
              color: '#fff',
              fontWeight: 600,
              borderRadius: '8px',
              padding: '10px',
              margin: 0,
            }}
          >
            가장 최근 저장한 프리셋 불러오기
          </Button>

          {/* 버튼 2: 레시피 생성하기 */}
          <Button
            onClick={handleGoToCreatePage}
            variant="outlined"
            fullWidth
            style={{
              borderColor: '#ccc',
              color: '#555',
              fontWeight: 600,
              borderRadius: '8px',
              padding: '10px',
              margin: 0,
            }}
          >
            레시피 생성하기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
