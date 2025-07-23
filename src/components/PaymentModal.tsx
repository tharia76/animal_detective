import React from 'react';
import { Modal, View, Text, TouchableOpacity, Platform } from 'react-native';

type PaymentModalProps = {
  showPaymentModal: boolean;
  setShowPaymentModal: (show: boolean) => void;
  t: (key: string) => string;
  selectedLockedLevel: string | null;
  requestPurchase: (productId: string) => void;
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  showPaymentModal,
  setShowPaymentModal,
  t,
  selectedLockedLevel,
  requestPurchase,
}) => (
  <Modal
    visible={showPaymentModal}
    transparent={true}
    animationType="fade"
    onRequestClose={() => setShowPaymentModal(false)}
    supportedOrientations={['landscape', 'landscape-left', 'landscape-right']}
  >
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }}>
      <View style={{
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
          {t('unlockLevel')}
        </Text>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          {t('unlockMessage').replace('{level}', t(selectedLockedLevel || ''))}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#f0f0f0',
              padding: 12,
              borderRadius: 10,
              width: '45%',
              alignItems: 'center'
            }}
            onPress={() => setShowPaymentModal(false)}
          >
            <Text>{t('cancel')}</Text>
          </TouchableOpacity>
          {Platform.OS === 'ios' ? (
            <TouchableOpacity
              style={{
                backgroundColor: '#0066CC',
                padding: 12,
                borderRadius: 10,
                width: '45%',
                alignItems: 'center'
              }}
              onPress={() => selectedLockedLevel && requestPurchase(`com.mygame.level.${selectedLockedLevel}`)}
              disabled={!selectedLockedLevel}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{t('appStorePay')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: '#689F38',
                padding: 12,
                borderRadius: 10,
                width: '45%',
                alignItems: 'center'
              }}
              onPress={() => selectedLockedLevel && requestPurchase(`com.mygame.level.${selectedLockedLevel}`)}
              disabled={!selectedLockedLevel}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{t('googlePlayPay')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  </Modal>
);

export default PaymentModal;