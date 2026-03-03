<!--
  DROPZONE COMPONENT
  Drag-and-drop file upload with click-to-browse fallback.

  USAGE
  -------------------------------------------------------------------------
  <DropZone onfiles={handleFiles} />
  <DropZone accept=".json,.csv" maxSize={5 * 1024 * 1024} onfiles={handleFiles} />
  <DropZone multiple onfiles={handleFiles} />
  <DropZone disabled />
  -------------------------------------------------------------------------

  PROPS:
  - accept:   File type filter (e.g., ".json,.csv", "image/*")
  - maxSize:  Maximum file size in bytes (0 = no limit)
  - multiple: Allow multiple file selection
  - disabled: Disable all interaction
  - onfiles:  Callback with validated File[] on selection or drop
  - class:    Consumer classes on the outer .dropzone div

  STATES:
  - idle:        Dashed border, Upload icon, prompt text
  - drag-active: data-state="active" — highlighted border/bg, icon color
  - has-files:   FileCheck icon, file count + names displayed

  @see _inputs.scss .dropzone for physics styling
-->

<script lang="ts">
  import { Upload, FileCheck } from '@lucide/svelte';
  import { toast } from '@stores/toast.svelte';

  interface DropZoneProps {
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
    disabled?: boolean;
    onfiles?: (files: File[]) => void;
    class?: string;
  }

  let {
    accept = '',
    maxSize = 0,
    multiple = false,
    disabled = false,
    onfiles,
    class: className = '',
  }: DropZoneProps = $props();

  let dragCounter = $state(0);
  let files = $state<File[]>([]);
  let inputEl: HTMLInputElement | undefined = $state();

  let dragActive = $derived(dragCounter > 0);
  let hasFiles = $derived(files.length > 0);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  function matchesAccept(file: File, acceptStr: string): boolean {
    const tokens = acceptStr.split(',').map((t) => t.trim().toLowerCase());

    for (const token of tokens) {
      if (token.endsWith('/*')) {
        if (file.type.toLowerCase().startsWith(token.slice(0, -2))) return true;
      } else if (token.startsWith('.')) {
        if (file.name.toLowerCase().endsWith(token)) return true;
      } else {
        if (file.type.toLowerCase() === token) return true;
      }
    }

    return false;
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function validateFiles(fileList: FileList): File[] {
    const valid: File[] = [];

    for (const file of fileList) {
      if (accept && !matchesAccept(file, accept)) {
        toast.show(`"${file.name}" — file type not accepted`, 'error');
        continue;
      }

      if (maxSize > 0 && file.size > maxSize) {
        toast.show(
          `"${file.name}" exceeds ${formatSize(maxSize)} limit`,
          'error',
        );
        continue;
      }

      valid.push(file);
    }

    return valid;
  }

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function processFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const validated = validateFiles(fileList);
    if (validated.length === 0) return;

    files = multiple ? validated : [validated[0]];
    onfiles?.(files);
  }

  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    if (disabled) return;
    dragCounter++;
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    if (disabled) return;
    dragCounter--;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    if (disabled) return;
    dragCounter = 0;

    if (e.dataTransfer?.files) {
      processFiles(e.dataTransfer.files);
    }
  }

  function handleInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    processFiles(input.files);
    input.value = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputEl?.click();
    }
  }
</script>

<div
  class="dropzone flex flex-col items-center justify-center text-center p-md w-full {className}"
  data-state={dragActive ? 'active' : undefined}
  role="button"
  tabindex={disabled ? -1 : 0}
  aria-label={hasFiles
    ? `${files.length} file${files.length > 1 ? 's' : ''} selected. Click to change.`
    : 'Drop files here or click to browse'}
  aria-disabled={disabled || undefined}
  onclick={() => {
    if (!disabled) inputEl?.click();
  }}
  ondragenter={handleDragEnter}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  onkeydown={handleKeydown}
>
  <input
    bind:this={inputEl}
    type="file"
    {accept}
    {multiple}
    {disabled}
    onchange={handleInputChange}
    tabindex={-1}
    aria-hidden="true"
  />

  <div class="dropzone-content flex flex-col items-center gap-sm">
    {#if hasFiles}
      <FileCheck class="icon" data-size="xl" />
      <p>
        {files.length} file{files.length > 1 ? 's' : ''} selected
      </p>
      <p class="text-caption">
        {files.map((f) => f.name).join(', ')}
      </p>
    {:else}
      <Upload class="icon" data-size="xl" />
      <p>
        {#if dragActive}
          Release to upload
        {:else}
          Drag files here or click to browse
        {/if}
      </p>
    {/if}
  </div>
</div>
