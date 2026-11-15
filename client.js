/**
 * Client half of the workspace beautifier bundle.
 *
 * What it does:
 * - Typography for the two kinds of rows in the left sidebar's session list. A
 *   project row is `<div data-row-key="workspace:<key>" role="treeitem">` whose
 *   title is the `<span>` inside its `<span class="projectText">`; a nested
 *   project sits below a `<div role="group">` and keeps the plain typography. A
 *   session row is `<div data-row-key="session:<id>">` whose second `<span>`
 *   child is the title. Family, size, weight and italic for both kinds are
 *   chosen on the plugin's Settings page and stored in this browser.
 * - A "Collapse all" control in the Workspace section header, right after the
 *   section label and before the search button. That header has no slot, so the
 *   button is inserted into it as our own element, anchored after the label and
 *   re-anchored by a light interval if the header re-renders (React never
 *   removes nodes it does not own). It hides itself when the header hides the
 *   label — the collapsed 56px rail — and while the search field is open.
 *
 * A press on that control walks the expanded project rows and presses each one,
 * last first, re-reading the list after every press: a collapsed project takes
 * its nested rows out of the page, and pressing a row is exactly what clicking
 * it does. Nothing about the list's state is written directly.
 */
window.__ModuleLoader__.load({
  id: 'workspace-font',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const AREA = '[data-sidebar-list-area]';
    const PROJECT = '[data-row-key^="workspace:"]';
    const SESSION = '[data-row-key^="session:"]';
    const HEADER = '[data-sidebar-workspace-header]';
    const NAMESPACE = 'workspaceFont';
    const STORAGE_KEY = 'dsh.workspace-font.typography.v1';
    /** The key this bundle used before it was renamed; read so a saved choice survives. */
    const LEGACY_STORAGE_KEY = 'dsh.workspace-beautify.typography.v1';

    const ICON = [
      '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"',
      ' stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
      '<path d="M4.25 2.5 8 6.25l3.75-3.75"/>',
      '<path d="M4.25 13.5 8 9.75l3.75 3.75"/>',
      '</svg>',
    ].join('');

    /** Font choices offered on the Settings page, as CSS font stacks. */
    const FAMILIES = {
      inherit: 'inherit',
      sans: 'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Courier New", monospace',
      serif: 'Georgia, "Times New Roman", "Songti SC", SimSun, serif',
      kai: 'KaiTi, STKaiti, "Kaiti SC", STSong, serif',
    };

    const DEFAULTS = {
      project: { family: 'inherit', size: 14, bold: true, italic: false },
      session: { family: 'inherit', size: 13, bold: false, italic: false },
    };

    /** Sizes the Settings page offers; the stored value is clamped to this range. */
    const SIZES = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    /** Static chrome: the header control and the Settings page itself. */
    const CHROME = [
      '.wb-header-button { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; margin: 0; padding: 0; border: none; border-radius: var(--dsw-radius-sm); background: transparent; color: inherit; cursor: pointer; }',
      '@media (hover: hover) { .wb-header-button:hover { background-color: var(--dsw-alias-interactive-bg-hover); } }',
      '.wb-header-button:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: -2px; }',
      '.wb-settings { display: flex; flex-direction: column; width: 100%; }',
      '.wb-settings-hint { margin: 0 0 8px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary); }',
      '.wb-settings-group { display: flex; flex-direction: column; }',
      '.wb-settings-heading { margin: 20px 0 2px; font-size: 13px; font-weight: 600; line-height: 20px; color: var(--dsw-alias-label-secondary); }',
      '.wb-settings-row { display: flex; align-items: center; gap: 8px; padding: 12px 0; border-bottom: 0.5px solid var(--dsw-alias-border-l2); }',
      '.wb-settings-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }',
      '.wb-settings-title { font-size: 14px; line-height: 22px; color: var(--dsw-alias-label-primary); }',
      '.wb-settings-desc { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary); }',
      '.wb-settings-control { flex: none; display: inline-flex; align-items: center; gap: 6px; }',
      '.wb-settings-select { height: 32px; padding: 0 10px; border: none; border-radius: var(--dsw-radius-md); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; min-width: 150px; }',
      '.wb-settings-size { min-width: 88px; }',
      '.wb-settings-checkbox { width: 16px; height: 16px; accent-color: var(--dsw-alias-brand-primary); cursor: pointer; }',
      '.wb-settings-preview { display: flex; flex-direction: column; gap: 8px; margin: 10px 0 4px; padding: 12px; border-radius: var(--dsw-radius-md); background: var(--dsw-alias-bg-layer-2); }',
      '.wb-settings-actions { margin-top: 20px; }',
      '.wb-settings-reset { height: 32px; padding: 0 14px; border: none; border-radius: var(--dsw-radius-md); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); font: inherit; font-size: 13px; cursor: pointer; }',
      '@media (hover: hover) { .wb-settings-reset:hover { background-color: var(--dsw-alias-interactive-bg-hover); } }',
      '.wb-settings-select:focus-visible, .wb-settings-size:focus-visible, .wb-settings-reset:focus-visible, .wb-settings-checkbox:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }',
    ].join('\n');

    /** Keep stored or hand-edited values inside what the page can draw. */
    function sanitize(raw) {
      const clean = { project: { ...DEFAULTS.project }, session: { ...DEFAULTS.session } };
      for (const group of ['project', 'session']) {
        const value = raw === null || typeof raw !== 'object' ? undefined : raw[group];
        if (value === null || typeof value !== 'object') continue;
        if (typeof value.family === 'string' && Object.hasOwn(FAMILIES, value.family)) clean[group].family = value.family;
        const size = Number(value.size);
        if (Number.isFinite(size)) clean[group].size = Math.min(20, Math.max(11, Math.round(size)));
        if (typeof value.bold === 'boolean') clean[group].bold = value.bold;
        if (typeof value.italic === 'boolean') clean[group].italic = value.italic;
      }
      return clean;
    }

    /** Read what this page saved, including a value stored under the bundle's previous name. */
    function readStored() {
      for (const key of [STORAGE_KEY, LEGACY_STORAGE_KEY]) {
        try {
          const raw = window.localStorage.getItem(key);
          if (raw !== null) return JSON.parse(raw);
        } catch {
          // An unreadable or malformed entry falls through to the next key.
        }
      }
      return null;
    }

    let typography = sanitize(readStored());
    const listeners = new Set();

    /** Apply and persist a new typography choice, then refresh every reader. */
    function writeTypography(next) {
      typography = sanitize(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(typography));
      } catch {
        // A browser that refuses storage keeps the choice for this page only.
      }
      for (const listener of [...listeners]) listener();
    }

    /** Read the live typography, re-rendering the caller when it changes. */
    function useTypography() {
      const [, bump] = React.useState(0);
      React.useEffect(() => {
        const listener = () => { bump(count => count + 1); };
        listeners.add(listener);
        return () => { listeners.delete(listener); };
      }, []);
      return typography;
    }

    /** One kind of row's declarations. */
    function typographyOf(value) {
      return [
        `font-family: ${FAMILIES[value.family] ?? 'inherit'}`,
        `font-size: ${value.size}px`,
        `font-weight: ${value.bold ? 600 : 400}`,
        `font-style: ${value.italic ? 'italic' : 'normal'}`,
      ].join('; ');
    }

    /** The whole stylesheet: static chrome plus the two configurable rows. */
    function rulesFor(value) {
      return [
        CHROME,
        `${AREA} ${PROJECT} > span > span { ${typographyOf(value.project)}; }`,
        `${AREA} [role="group"] ${PROJECT} > span > span { font-family: inherit; font-size: inherit; font-weight: 400; font-style: normal; }`,
        `${AREA} ${SESSION} > span:nth-of-type(2) { ${typographyOf(value.session)}; }`,
      ].join('\n');
    }

    /** Project rows of the sidebar list that are currently expanded. */
    function expandedProjects() {
      return [...document.querySelectorAll(`${AREA} ${PROJECT}[aria-expanded="true"]`)];
    }

    /** Fold every expanded project, one press per pass. */
    function collapseAllProjects() {
      for (let guard = 0; guard < 200; guard += 1) {
        const rows = expandedProjects();
        const row = rows[rows.length - 1];
        if (row === undefined) return;
        row.click();
      }
    }

    return {
      inject: ['slots', 'locale', 'timer'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NAMESPACE, {
          zh: {
            collapseAll: '全部折叠',
            'settings.nav': '工作区美化',
            'settings.hint': '只影响侧边栏的显示；设置保存在本浏览器里。',
            'settings.group.project': '项目文件夹',
            'settings.group.session': '会话行',
            'settings.family': '字体',
            'settings.family.inherit': '跟随界面',
            'settings.family.sans': '系统无衬线',
            'settings.family.mono': '等宽',
            'settings.family.serif': '衬线',
            'settings.family.kai': '楷体',
            'settings.size': '字号',
            'settings.bold': '加粗',
            'settings.italic': '斜体',
            'settings.preview': '预览',
            'settings.preview.project': '示例项目文件夹',
            'settings.preview.session': '示例会话标题',
            'settings.reset': '恢复默认',
          },
          en: {
            collapseAll: 'Collapse all',
            'settings.nav': 'Workspace polish',
            'settings.hint': 'Display only; the choice is saved in this browser.',
            'settings.group.project': 'Project folders',
            'settings.group.session': 'Session rows',
            'settings.family': 'Font',
            'settings.family.inherit': 'Follow the interface',
            'settings.family.sans': 'System sans',
            'settings.family.mono': 'Monospace',
            'settings.family.serif': 'Serif',
            'settings.family.kai': 'Kai',
            'settings.size': 'Size',
            'settings.bold': 'Bold',
            'settings.italic': 'Italic',
            'settings.preview': 'Preview',
            'settings.preview.project': 'Sample project folder',
            'settings.preview.session': 'Sample session title',
            'settings.reset': 'Restore defaults',
          },
        }));
        const t = ctx.locale.bind(NAMESPACE);

        /** The stylesheet, re-rendered whenever the typography changes. */
        function Styles() {
          const value = useTypography();
          return h('style', { 'data-workspace-font': '' }, rulesFor(value));
        }

        /** The Settings page: font, size, bold and italic for both row kinds. */
        function SettingsSection() {
          const value = useTypography();
          const set = (group, patch) => { writeTypography({ ...value, [group]: { ...value[group], ...patch } }); };

          const row = (titleKey, control) => h('div', { className: 'wb-settings-row' },
            h('div', { className: 'wb-settings-text' }, h('div', { className: 'wb-settings-title' }, t(titleKey))),
            h('div', { className: 'wb-settings-control' }, control),
          );

          const familyControl = (group) => h('select', {
            className: 'wb-settings-select',
            value: value[group].family,
            'aria-label': t('settings.family'),
            onChange: (event) => { set(group, { family: event.target.value }); },
          }, Object.keys(FAMILIES).map(key => h('option', { key, value: key }, t(`settings.family.${key}`))));

          const sizeControl = (group) => h('select', {
            className: 'wb-settings-select wb-settings-size',
            value: String(value[group].size),
            'aria-label': t('settings.size'),
            onChange: (event) => { set(group, { size: Number(event.target.value) }); },
          }, SIZES.map(size => h('option', { key: size, value: String(size) }, `${size} px`)));

          const toggle = (group, field, labelKey) => h('input', {
            className: 'wb-settings-checkbox',
            type: 'checkbox',
            checked: value[group][field],
            'aria-label': t(labelKey),
            onChange: (event) => { set(group, { [field]: event.target.checked }); },
          });

          const groupBlock = (group, headingKey) => h('div', { className: 'wb-settings-group' },
            h('div', { className: 'wb-settings-heading' }, t(headingKey)),
            row('settings.family', familyControl(group)),
            row('settings.size', sizeControl(group)),
            row('settings.bold', toggle(group, 'bold', 'settings.bold')),
            row('settings.italic', toggle(group, 'italic', 'settings.italic')),
          );

          const sample = (group, labelKey) => h('span', {
            style: {
              fontFamily: FAMILIES[value[group].family] ?? 'inherit',
              fontSize: `${value[group].size}px`,
              fontWeight: value[group].bold ? 600 : 400,
              fontStyle: value[group].italic ? 'italic' : 'normal',
              color: 'var(--dsw-alias-label-primary)',
            },
          }, t(labelKey));

          return h('div', { className: 'wb-settings' },
            h('p', { className: 'wb-settings-hint' }, t('settings.hint')),
            groupBlock('project', 'settings.group.project'),
            groupBlock('session', 'settings.group.session'),
            h('div', { className: 'wb-settings-group' },
              h('div', { className: 'wb-settings-heading' }, t('settings.preview')),
              h('div', { className: 'wb-settings-preview' },
                sample('project', 'settings.preview.project'),
                sample('session', 'settings.preview.session'),
              ),
            ),
            h('div', { className: 'wb-settings-actions' },
              h('button', {
                type: 'button', className: 'wb-settings-reset',
                onClick: () => { writeTypography(DEFAULTS); },
              }, t('settings.reset')),
            ),
          );
        }

        /** The Settings nav glyph: a folder with a bold line inside it. */
        function SettingsIcon() {
          return h('svg', {
            width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none',
            stroke: 'currentColor', strokeWidth: 1.4, strokeLinejoin: 'round', 'aria-hidden': 'true',
          },
            h('path', { d: 'M1.6 4.4A1.4 1.4 0 0 1 3 3h2.9l1.3 1.3h5.8A1.4 1.4 0 0 1 14.4 5.7v6A1.4 1.4 0 0 1 13 13.1H3a1.4 1.4 0 0 1-1.4-1.4z' }),
            h('path', { d: 'M5 8.4h6' }),
          );
        }

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay', id: 'workspace-font', order: 900,
        }, Styles));

        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section', id: 'workspace-font', order: 50,
          label: () => t('settings.nav'),
        }, SettingsSection));

        ctx.slots.inject('settings.section.icon', () => ctx.slots.register({
          name: 'settings.section.icon', id: 'workspace-font', order: 50,
        }, SettingsIcon));

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'wb-header-button';
        button.innerHTML = ICON;
        button.addEventListener('click', collapseAllProjects);

        const relabel = () => {
          const label = t('collapseAll');
          button.setAttribute('aria-label', label);
          button.title = label;
        };
        relabel();
        ctx.on('locale/change', relabel);

        /** Keep the control anchored after the section label, or hide it. */
        const place = () => {
          const header = document.querySelector(HEADER);
          if (header === null) {
            button.remove();
            return;
          }
          const label = header.querySelector(':scope > span');
          if (label === null) {
            button.remove();
            return;
          }
          if (button.parentElement !== header || button.previousElementSibling !== label) {
            label.insertAdjacentElement('afterend', button);
          }
          const search = header.querySelector('button[aria-expanded]');
          const searching = search !== null && search.getAttribute('aria-expanded') === 'true';
          button.style.display = searching ? 'none' : '';
        };

        ctx.effect(() => {
          place();
          const stop = ctx.interval(place, 800);
          return () => {
            stop();
            button.removeEventListener('click', collapseAllProjects);
            button.remove();
          };
        });
      },
    };
  },
});
