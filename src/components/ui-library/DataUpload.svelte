<script lang="ts">
  import { toast } from '@stores/toast.svelte';
  import DropZone from '../ui/DropZone.svelte';
</script>

<section id="data-upload" class="flex flex-col gap-md">
  <h2>06 // DATA UPLOAD</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      The <code>DropZone</code> component wraps a native
      <code>&lt;input type="file"&gt;</code> with full drag-and-drop support. It
      reuses the <code>.dropzone</code> physics from
      <code>_inputs.scss</code> — dashed sunk border, spring transitions, and
      energy-highlighted drag-over state via
      <code>data-state="active"</code>. Files are validated against
      <code>accept</code> and <code>maxSize</code> constraints, with rejected
      files reported through toast errors. Icons switch between
      <code>Upload</code> (idle) and <code>FileCheck</code> (files selected) from
      Lucide.
    </p>

    <!-- ─── BASIC UPLOAD ───────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Basic Upload</h5>
      <p class="text-small text-mute">
        Single-file drop zone with no restrictions. Accepts any file type and
        size. Drag a file over the zone to see the active state, or click to
        open the file browser.
      </p>

      <div class="surface-sunk p-md">
        <DropZone
          onfiles={(files) => {
            toast.show(
              `Uploaded: ${files.map((f) => f.name).join(', ')}`,
              'success',
            );
          }}
        />
      </div>
    </div>

    <!-- ─── RESTRICTED UPLOAD ──────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Restricted Upload</h5>
      <p class="text-small text-mute">
        Accepts only <code>.json</code> and <code>.csv</code> files up to
        <strong>2 MB</strong>. The <code>accept</code> prop filters the native
        file browser and validates dropped files. The <code>maxSize</code> prop rejects
        oversized files with an error toast.
      </p>

      <div class="surface-sunk p-md">
        <DropZone
          accept=".json,.csv"
          maxSize={2 * 1024 * 1024}
          onfiles={(files) => {
            toast.show(`Valid upload: ${files[0].name}`, 'success');
          }}
        />
      </div>
    </div>

    <!-- ─── MULTIPLE FILES ─────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Multiple Files</h5>
      <p class="text-small text-mute">
        Enables multi-file selection via the <code>multiple</code> prop. Drop several
        files at once or select multiple in the file browser.
      </p>

      <div class="surface-sunk p-md">
        <DropZone
          multiple
          onfiles={(files) => {
            toast.show(
              `${files.length} file${files.length > 1 ? 's' : ''} received`,
              'info',
            );
          }}
        />
      </div>
    </div>

    <details>
      <summary>View Code</summary>
      <pre><code
          >&lt;script&gt;
  import DropZone from './ui/DropZone.svelte';
&lt;/script&gt;

&lt;!-- Basic (any file) --&gt;
&lt;DropZone onfiles=&#123;(files) =&gt; console.log(files)&#125; /&gt;

&lt;!-- Restricted (type + size) --&gt;
&lt;DropZone
  accept=".json,.csv"
  maxSize=&#123;2 * 1024 * 1024&#125;
  onfiles=&#123;handleFiles&#125;
/&gt;

&lt;!-- Multiple files --&gt;
&lt;DropZone multiple onfiles=&#123;handleFiles&#125; /&gt;</code
        ></pre>
    </details>

    <p class="text-caption text-mute px-xs">
      Props: <code>accept</code>, <code>maxSize</code> (bytes),
      <code>multiple</code>, <code>onfiles</code> (callback).
    </p>
  </div>
</section>
