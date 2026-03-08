"use client";

import { useEffect, useRef, useCallback } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, lineNumbers, highlightActiveLine, highlightActiveLineGutter, keymap, placeholder as placeholderExt } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { bracketMatching, foldGutter, syntaxHighlighting, defaultHighlightStyle } from "@codemirror/language";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { diffLabTheme } from "@/lib/editor/theme";
import { getLanguageExtension } from "@/lib/editor/languages";
import type { Format } from "@/types";
import { FORMAT_LABELS } from "@/types";

interface CodeMirrorEditorProps {
  value: string;
  format: Format;
  formatOnPaste?: boolean;
  onChange: (value: string) => void;
  onFormat?: () => void;
  placeholder?: string;
}

export function CodeMirrorEditor({
  value,
  format,
  formatOnPaste,
  onChange,
  onFormat,
  placeholder,
}: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const langCompartment = useRef(new Compartment());
  const placeholderCompartment = useRef(new Compartment());
  const onChangeRef = useRef(onChange);
  const onFormatRef = useRef(onFormat);
  const formatOnPasteRef = useRef(formatOnPaste);
  onChangeRef.current = onChange;
  onFormatRef.current = onFormat;
  formatOnPasteRef.current = formatOnPaste;

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const pasteHandler = EditorView.domEventHandlers({
      paste: () => {
        if (formatOnPasteRef.current && onFormatRef.current) {
          setTimeout(() => onFormatRef.current?.(), 0);
        }
        return false;
      },
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        bracketMatching(),
        foldGutter(),
        highlightSelectionMatches(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
        langCompartment.current.of([]),
        diffLabTheme,
        updateListener,
        pasteHandler,
        placeholderCompartment.current.of(placeholderExt(placeholder ?? `Paste or drop ${FORMAT_LABELS[format]} here...`)),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    // Load initial language
    getLanguageExtension(format).then((ext) => {
      if (viewRef.current) {
        viewRef.current.dispatch({
          effects: langCompartment.current.reconfigure(ext),
        });
      }
    });

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on mount
  }, []);

  // Sync external value changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentValue = view.state.doc.toString();
    if (currentValue !== value) {
      view.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value },
      });
    }
  }, [value]);

  // Swap language extension when format changes
  const updateLanguage = useCallback(async (fmt: Format) => {
    const view = viewRef.current;
    if (!view) return;
    const ext = await getLanguageExtension(fmt);
    view.dispatch({
      effects: langCompartment.current.reconfigure(ext),
    });
  }, []);

  useEffect(() => {
    updateLanguage(format);
  }, [format, updateLanguage]);

  // Update placeholder when format changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: placeholderCompartment.current.reconfigure(
        placeholderExt(placeholder ?? `Paste or drop ${FORMAT_LABELS[format]} here...`),
      ),
    });
  }, [format, placeholder]);

  return (
    <div
      ref={containerRef}
      className="min-h-[260px] max-h-[500px] overflow-auto [&_.cm-editor]:min-h-[260px] [&_.cm-editor]:outline-none"
    />
  );
}
