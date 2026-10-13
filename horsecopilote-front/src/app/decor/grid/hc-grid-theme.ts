import {
  CellStyleModule,
  ClientSideRowModelModule,
  LocaleModule,
  ModuleRegistry,
  RowStyleModule,
  themeQuartz,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  CellStyleModule,
  RowStyleModule,
  LocaleModule,
]);

export const hcGridTheme = themeQuartz.withParams({
  fontFamily: 'var(--hc-font-body)',
  fontSize: 14,
  headerFontSize: 12,
  headerFontWeight: 500,
  backgroundColor: 'var(--hc-bg-surface)',
  foregroundColor: 'var(--hc-text-primary)',
  accentColor: 'var(--hc-brand-primary)',
  borderColor: 'var(--hc-border-default)',
  headerBackgroundColor: 'var(--hc-bg-subtle)',
  headerTextColor: 'var(--hc-text-muted)',
  rowHoverColor: 'var(--hc-bg-page)',
  wrapperBorderRadius: 'var(--hc-radius-lg)',
  cellHorizontalPadding: 20,
  columnBorder: false,
  headerColumnBorder: false,
});
