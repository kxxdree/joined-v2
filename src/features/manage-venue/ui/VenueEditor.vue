<script setup lang="ts">
import { useEventCatalog } from "@entities/event";
import { canManageVenue, useSession } from "@entities/session";
import { useVenueCatalog } from "@entities/venue";
import { useToast } from "@shared/lib";
import { cloneContent, editorSections, validateContent, type ContentIssue, type EditorSection, type VenueContent } from "../model/content";
import { useVenueWorkspace } from "../model/workspace";
import EditorField from "./EditorField.vue";
import EditorList from "./EditorList.vue";
import EditorMedia from "./EditorMedia.vue";
import VenueDetailsEditor from "./VenueDetailsEditor.vue";
import VenueEventsEditor from "./VenueEventsEditor.vue";

const props = defineProps<{ slug: string }>();
const { getVenue } = useVenueCatalog();
const { events } = useEventCatalog();
const { save, isReady, storageError } = useVenueWorkspace();
const { push } = useToast();
const { user } = useSession();
const activeSection = ref<EditorSection>("overview");
const formContent = ref<VenueContent>();
const savedSnapshot = ref("");
const savedVenueName = ref("");
const issues = ref<ContentIssue[]>([]);
const saveError = ref("");
const editorBody = ref<HTMLElement>();
const pendingUploads = ref(0);
provide("venue-editor-upload-count", pendingUploads);
const dirty = computed(() => !!formContent.value && JSON.stringify(formContent.value) !== savedSnapshot.value);
const currentSection = computed(() => editorSections.find((section) => section.id === activeSection.value)!);
const initialize = () => {
  if (!canManageVenue(user.value, props.slug)) return;
  const venue = getVenue(props.slug);
  if (!venue) return;
  const content = { venue: cloneContent(venue), events: cloneContent(events.value.filter((event) => event.venue === venue.slug)) };
  savedSnapshot.value = JSON.stringify(content);
  savedVenueName.value = content.venue.name;
  formContent.value = content;
};
watch(
  isReady,
  (ready) => {
    if (ready && import.meta.client) initialize();
  },
  { immediate: true },
);
const showSection = async (section: EditorSection) => {
  activeSection.value = section;
  await nextTick();
  editorBody.value?.scrollIntoView({ behavior: "smooth", block: "start" });
  editorBody.value?.focus({ preventScroll: true });
};
const saveChanges = async () => {
  if (!formContent.value || pendingUploads.value) return;
  if (!canManageVenue(user.value, props.slug)) {
    saveError.value = "Доступно управление только своим заведением.";
    return;
  }
  saveError.value = "";
  const content = cloneContent(formContent.value);
  content.events.forEach((event) => {
    event.venue = content.venue.slug;
  });
  issues.value = validateContent(content);
  if (content.venue.slug !== props.slug) issues.value.unshift({ section: "overview", message: "Адрес существующей страницы нельзя изменить." });
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formContent.value.venue.slug) || formContent.value.venue.slug === "new")
    issues.value.unshift({ section: "overview", message: "Адрес страницы: используйте латинские буквы, цифры и дефисы; «new» зарезервирован." });
  if (issues.value.length) {
    await showSection(issues.value[0]!.section);
    return;
  }
  try {
    save(content);
    savedSnapshot.value = JSON.stringify(content);
    savedVenueName.value = content.venue.name;
    formContent.value = content;
    push("Изменения сохранены. Страница заведения обновлена.");
  } catch {
    saveError.value =
      "Не удалось сохранить изменения. Возможно, закончилось место в браузере. Уменьшите количество загруженных фото. Ваши правки остаются в форме.";
  }
};
const beforeUnload = (event: BeforeUnloadEvent) => {
  if (!dirty.value && !pendingUploads.value) return;
  event.preventDefault();
  event.returnValue = "";
};
onBeforeRouteLeave(() => {
  if (pendingUploads.value) return window.confirm("Фотографии ещё обрабатываются. Выйти и прервать загрузку?");
  if (!dirty.value) return true;
  return window.confirm("Изменения ещё не сохранены на странице заведения. Выйти из редактора?");
});
onMounted(() => window.addEventListener("beforeunload", beforeUnload));
onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", beforeUnload);
});

useHead({ title: computed(() => `${savedVenueName.value || "Заведение"} · Кабинет — Joined`) });
</script>

<template>
  <div class="container-x pt-7 pb-10 sm:pt-10">
    <div v-if="!isReady" class="card mt-8 p-8" role="status">Загружаем ваши данные…</div>
    <div v-else-if="!formContent" class="card mt-8 p-8">
      <h1 class="text-2xl">Заведение не найдено</h1>
      <p class="mt-3 text-muted">Проверьте привязку заведения к вашему аккаунту или обратитесь в поддержку.</p>
    </div>
    <template v-else>
      <header class="mt-6 mb-8 flex flex-wrap items-end justify-between gap-5">
        <div class="min-w-0">
          <p class="mb-3 text-sm text-accent-text">Кабинет заведения</p>
          <h1 class="h-display text-4xl wrap-break-word sm:text-5xl">{{ savedVenueName || "Новое место" }}</h1>
        </div>
        <NuxtLink :to="`/venues/${slug}`" target="_blank" class="pill bg-[#4a4a4a] px-4 py-2.5 font-semibold hover:bg-[#555555]">Открыть страницу</NuxtLink>
      </header>
      <p v-if="storageError" role="alert" class="mb-5 text-sm text-accent-text">{{ storageError }}</p>
      <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
        <aside class="sticky top-24 z-30 min-w-0 lg:top-28">
          <nav aria-label="Разделы редактора" class="card flex gap-1 overflow-x-auto p-2 lg:flex-col">
            <button
              v-for="section in editorSections"
              :key="section.id"
              type="button"
              :aria-current="activeSection === section.id ? 'step' : undefined"
              class="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm transition-colors"
              :class="activeSection === section.id ? 'bg-white/8 text-white' : 'text-muted hover:bg-white/4 hover:text-white'"
              @click="showSection(section.id)"
            >
              <span class="flex-1 whitespace-nowrap">{{ section.name }}</span>
              <span v-if="issues.some((issue) => issue.section === section.id)" class="text-accent-text" aria-label="Есть ошибки">!</span>
            </button>
          </nav>
        </aside>
        <div ref="editorBody" tabindex="-1" class="min-w-0 scroll-mt-48 outline-none lg:scroll-mt-28">
          <div v-if="issues.length || saveError" role="alert" class="mb-5 rounded-2xl border border-accent/40 bg-accent-deep p-5">
            <h2 class="font-medium">{{ saveError ? "Изменения пока не сохранены" : "Осталось кое-что проверить" }}</h2>
            <p v-if="saveError" class="mt-2 text-sm leading-relaxed">{{ saveError }}</p>
            <ul v-else class="mt-3 space-y-2">
              <li v-for="(issue, index) in issues" :key="index">
                <button
                  type="button"
                  class="text-left text-sm underline decoration-white/30 underline-offset-4 hover:text-sand"
                  @click="showSection(issue.section)"
                >
                  {{ issue.message }}
                </button>
              </li>
            </ul>
          </div>
          <form class="card p-5 sm:p-8 lg:p-9" novalidate @submit.prevent="saveChanges">
            <div class="mb-8 border-b border-line pb-6">
              <h2 class="text-2xl font-medium">{{ currentSection.name }}</h2>
            </div>
            <VenueDetailsEditor
              v-if="['overview', 'location', 'hours'].includes(activeSection)"
              v-model="formContent.venue"
              :section="activeSection"
              :is-new="false"
            />
            <div v-else-if="activeSection === 'media'" class="space-y-10">
              <div>
                <h3 class="mb-2 font-medium">Обложка *</h3>
                <p class="mb-4 text-sm leading-relaxed text-muted">
                  Главное фото в каталоге и на странице заведения
                </p>
                <EditorMedia
                  :model-value="formContent.venue.photo ? [formContent.venue.photo] : []"
                  single
                  label="Обложка заведения"
                  @update:model-value="formContent.venue.photo = $event[0] ?? ''"
                />
              </div>
              <div>
                <h3 class="mb-2 font-medium">Галерея</h3>
                <EditorMedia v-model="formContent.venue.gallery" label="Галерея заведения" />
              </div>
            </div>
            <div v-else-if="activeSection === 'menu'" class="space-y-10">
              <div>
                <h3 class="mb-4 font-medium">Меню бара</h3>
                <EditorMedia v-model="formContent.venue.menu.bar" label="Меню бара" />
              </div>
              <div>
                <h3 class="mb-4 font-medium">Меню кухни</h3>
                <EditorMedia v-model="formContent.venue.menu.kitchen" label="Меню кухни" />
              </div>
            </div>
            <div v-else-if="activeSection === 'booking'" class="space-y-7">
              <EditorField label="Депозит на одного гостя, ₽" hint="Укажите 0, если депозит не требуется" required
                ><input v-model.number="formContent.venue.booking.deposit" type="number" min="0" class="field"
              /></EditorField>
              <div>
                <h3 class="mb-2 font-medium">Условия бронирования</h3>
                <p class="mb-4 text-sm text-muted">Расскажите об отмене, опоздании, предоплате и о том, как подтверждается столик</p>
                <EditorList
                  v-model="formContent.venue.booking.conditions"
                  label="Условие"
                  placeholder="Например, бронь сохраняется 15 минут после указанного времени"
                />
              </div>
            </div>
            <VenueEventsEditor v-else-if="activeSection === 'events'" v-model="formContent.events" :venue-slug="formContent.venue.slug" :cover="formContent.venue.photo" />
            <div v-else-if="activeSection === 'rules'" class="space-y-5">
              <p class="text-sm text-muted">Возрастные ограничения, дресс-код, посещение с детьми или питомцами — всё, что гостю полезно знать заранее</p>
              <EditorList v-model="formContent.venue.rules" label="Правило" placeholder="Например, вход на мероприятия с 18 лет" />
            </div>
            <div class="mt-8 flex justify-end">
              <button type="submit" class="btn-primary px-5 py-3 text-sm" :disabled="!dirty || !!pendingUploads">Сохранить</button>
            </div>
            <p v-if="pendingUploads" role="status" class="mt-3 text-sm text-muted">Обрабатываем фотографии…</p>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>
