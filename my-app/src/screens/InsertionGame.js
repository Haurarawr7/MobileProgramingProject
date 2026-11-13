import React, { useState } from 'react';
import { View } from 'react-native';
import { randomArray, sizeFor, maxFor, useStats } from './utils';
import { Tile, Row, Prompt, Label, Msg, Btn } from './ui';

export default function InsertionGame({ level, onFinish }) {
  const [list, setList] = useState(() => randomArray(sizeFor(level), maxFor(level)));
  const [i, setI] = useState(1);
  const [stats, { ok, bad }] = useStats();
  const [msg, setMsg] = useState('Ketuk angka tempat kartu baru harus disisipkan (di sebelah kirinya).');
  const n = list.length;
  const done = i >= n;
  const key = list[i];

  const correctPos = () => {
    const k = list.slice(0, i).findIndex((v) => v > key);
    return k === -1 ? i : k;
  };

  const place = (pos) => {
    if (done) return;
    if (pos !== correctPos()) {
      bad();
      setMsg('Belum tepat. Kartu harus ada setelah angka yang lebih kecil dan sebelum yang lebih besar.');
      return;
    }
    ok();
    const a = [...list];
    a.splice(i, 1);
    a.splice(pos, 0, key);
    setList(a);
    setI(i + 1);
    setMsg(i + 1 >= n ? 'Selesai! Semua angka sudah terurut.' : `Benar! ${key} disisipkan.`);
  };

  return (
    <View>
      <Prompt>{done ? 'Terurut!' : 'Sisipkan kartu ini'}</Prompt>
      {!done && (
        <Row><Tile value={key} state="active" size="big" /></Row>
      )}
      <Label>{done ? 'Hasil' : 'Sudah terurut (ketuk untuk menyisipkan di kirinya)'}</Label>
      <Row wrap>
        {list.slice(0, done ? n : i).map((v, k) => (
          <Tile key={k} value={v} state="good" onPress={done ? undefined : () => place(k)} />
        ))}
      </Row>
      {!done && (
        <>
          <Row><Btn label="Taruh di paling kanan" kind="secondary" onPress={() => place(i)} /></Row>
          {i + 1 < n && (
            <>
              <Label>Belum diurutkan</Label>
              <Row wrap>
                {list.slice(i + 1).map((v, k) => <Tile key={k} value={v} state="dim" />)}
              </Row>
            </>
          )}
        </>
      )}
      <Msg>{msg}</Msg>
      {done && <Row><Btn label="Lihat hasil" onPress={() => onFinish(stats)} /></Row>}
    </View>
  );
}
