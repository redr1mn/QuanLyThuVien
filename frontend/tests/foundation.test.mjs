import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import { z } from 'zod';
import { create } from 'zustand';

test('frontend foundation packages expose their public APIs', () => {
  assert.equal(typeof axios.create, 'function');
  assert.equal(typeof z.object, 'function');
  assert.equal(typeof create, 'function');
});
