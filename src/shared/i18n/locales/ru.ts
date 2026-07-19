export const ru = {
  shell: {
    brand: 'Dash',
    title: 'Runtime shell',
    header: 'Шапка',
    tagline: 'Простой каркас приложения',
    themeLight: 'Светлая',
    themeDark: 'Тёмная',
    language: 'Язык',
  },
  nav: {
    groupShell: 'Shell',
    groupModule: 'Модуль',
    hostHome: 'Домашняя хоста',
    hostHomeDesc: 'Страница, принадлежащая shell.',
    remoteModule: 'Удалённый модуль',
    remoteModuleDesc: 'Монтирует remote-модуль.',
    switcherAria: 'Переключить страницу',
  },
  host: {
    title: 'Страница хоста',
    description: 'Контент shell. Эта страница есть только в host-приложении.',
    owner: 'Владелец',
    ownerValue: 'Shell',
    ownerDesc: 'Рендерится runtime-mf-shell.',
    role: 'Роль',
    roleValue: 'Домашняя хоста',
    roleDesc: 'Одна вкладка shell / один путь shell.',
    crashTitle: 'Тест падения shell',
    crashDesc:
      'Бросает ошибку в дереве React shell. Должен показаться ShellErrorBoundary (на всю страницу), а не fallback слота remote.',
    crashButton: 'Уронить shell',
  },
  remote: {
    loading: 'Загрузка remote...',
    failedTitle: 'Remote не загрузился',
    slotCrashedTitle: 'Слот remote упал',
    unavailableTitle: 'Remote-модуль недоступен',
    unavailableDesc:
      'Shell остался работать. Этот слот не смог загрузить или отрисовать remote.',
    retry: 'Повторить',
  },
  shellError: {
    title: 'Что-то сломалось в shell',
    description:
      'Host-приложение поймало ошибку рендера. Retry перемонтирует UI shell.',
    label: 'Ошибка shell',
    retry: 'Повторить',
  },
} as const;
