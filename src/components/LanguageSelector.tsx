import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

type Language = {
  code: string;
  name: string;
};

type LanguageSelectorProps = {
  isLandscape: boolean;
  t: (key: string) => string;
  lang: string;
  languages: Language[];
  handleLanguageChange: (code: string) => void;
};

const getFlag = (code: string) => {
  switch (code) {
    case 'en': return '🇺🇸';
    case 'ru': return '🇷🇺';
    case 'es': return '🇪🇸';
    case 'de': return '🇩🇪';
    case 'fr': return '🇫🇷';
    case 'it': return '🇮🇹';
    case 'tr': return '🇹🇷';
    default: return '';
  }
};

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  isLandscape,
  t,
  lang,
  languages,
  handleLanguageChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedLanguage = languages.find(l => l.code === lang);

  // For full width in landscape, get device width
  const deviceWidth = Dimensions.get('window').width;

  return (
    <View style={{
      backgroundColor: 'rgba(115, 194, 185, 0.6)',
      padding: 10,
      borderRadius: 15,
      width: isLandscape ? 340 : '90%',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 0,
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 15
      }}>
        <Text style={{
          fontSize: 22,
          fontWeight: 'bold',
          color: '#612915',
          textAlign: 'left',
          flex: 1
        }}>
          {t('selectLevel')}
        </Text>
        <View style={{
          position: 'relative',
          zIndex: 10,
          width: isLandscape ? '100%' : '40%',
        }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 10,
              backgroundColor: 'orange',
              borderRadius: 10,
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.3,
              shadowRadius: 2,
              width: '100%',
            }}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Text style={{ fontWeight: 'bold', color: '#612915' }}>
              {selectedLanguage ? getFlag(selectedLanguage.code) : ''}
              {selectedLanguage ? selectedLanguage.name : ''}
            </Text>
            <Text style={{ marginLeft: 5 }}>▼</Text>
          </TouchableOpacity>

          {isDropdownOpen && (
            isLandscape ? (
              <View
                style={{
                  position: 'absolute',
                  top: 45,
                  left: -10,
                  width: '100%',
                  backgroundColor: 'white',
                  borderRadius: 10,
                  padding: 5,
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3,
                  zIndex: 9999,
                  maxHeight: 220,
                  alignSelf: 'center',
                }}
              >
                <ScrollView
                  style={{ width: '100%' }}
                  contentContainerStyle={{ paddingVertical: 2 }}
                  persistentScrollbar={true}
                  showsVerticalScrollIndicator={true}
                >
                  {languages.map((language) => (
                    <TouchableOpacity
                      key={language.code}
                      style={{
                        padding: 8,
                        marginVertical: 2,
                        backgroundColor: lang === language.code ? 'rgba(255, 165, 0, 0.2)' : 'transparent',
                        borderRadius: 5
                      }}
                      onPress={() => {
                        handleLanguageChange(language.code);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Text style={{
                        fontWeight: lang === language.code ? 'bold' : 'normal'
                      }}>
                        {getFlag(language.code) + ' '}
                        {language.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={{
                position: 'absolute',
                top: 45,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 5,
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                zIndex: 9999, // Ensure dropdown is on top
              }}>
                {languages.map((language) => (
                  <TouchableOpacity
                    key={language.code}
                    style={{
                      padding: 8,
                      marginVertical: 2,
                      backgroundColor: lang === language.code ? 'rgba(255, 165, 0, 0.2)' : 'transparent',
                      borderRadius: 5
                    }}
                    onPress={() => {
                      handleLanguageChange(language.code);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Text style={{
                      fontWeight: lang === language.code ? 'bold' : 'normal'
                    }}>
                      {getFlag(language.code) + ' '}
                      {language.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )
          )}
        </View>
      </View>
    </View>
  );
};

export default LanguageSelector;