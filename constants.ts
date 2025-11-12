
import { DesignStyle } from './types';
import { MinimalistIcon, ModernIcon, ScandinavianIcon, IndustrialIcon, BohemianIcon, CoastalIcon } from './components/icons/Icons';

export const DESIGN_STYLES: DesignStyle[] = [
  { name: 'Mid-Century Modern', icon: ModernIcon },
  { name: 'Scandinavian', icon: ScandinavianIcon },
  { name: 'Minimalist', icon: MinimalistIcon },
  { name: 'Industrial', icon: IndustrialIcon },
  { name: 'Bohemian', icon: BohemianIcon },
  { name: 'Coastal', icon: CoastalIcon },
];

export const IMAGE_EDIT_KEYWORDS = /change|add|remove|make|replace|put|insert|erase|update/i;
