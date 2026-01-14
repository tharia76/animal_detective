import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';

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
    case 'tr': return '🇹🇷';
    case 'es': return '🇪🇸';
    case 'pt': return '🇧🇷';
    default: return '🌍';
  }
};

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  isLandscape,
  t,
  lang,
  languages,
  handleLanguageChange,
}) => {
  // For potential width-based sizing if needed later
  const deviceWidth = Dimensions.get('window').width;

  // Even bigger sizes for improved visibility/tap targets
  const containerSize = isLandscape ? 92 : 80; // outer circle size
  const fontSize = isLandscape ? 58 : 50; // flag emoji size

  return (
    <View
      style={{
        backgroundColor: 'transparent',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 18,
        width: isLandscape ? 'auto' : '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {languages.map((language) => {
          const isActive = lang === language.code;
          return (
            <TouchableOpacity
              key={language.code}
              onPress={() => handleLanguageChange(language.code)}
              accessibilityRole="button"
              accessibilityLabel={language.name}
              style={{
                width: containerSize,
                height: containerSize,
                borderRadius: containerSize / 2,
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 8,
                marginVertical: 8,
                borderWidth: isActive ? 3 : 1,
                borderColor: isActive ? '#FF8C00' : 'rgba(0,0,0,0.15)',
                elevation: isActive ? 5 : 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize, lineHeight: fontSize }}>{getFlag(language.code)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default LanguageSelector;