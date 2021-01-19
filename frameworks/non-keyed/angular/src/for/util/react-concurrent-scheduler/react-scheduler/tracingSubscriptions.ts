/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import {enableSchedulerTracing} from './schedulerFeatureFlags';
import {__subscriberRef} from './tracing';

let subscribers: Set<any> = null;
if (enableSchedulerTracing) {
  subscribers = new Set();
}

export function unstable_subscribe(subscriber: any): void {
  if (enableSchedulerTracing) {
    subscribers.add(subscriber);

    if (subscribers.size === 1) {
      __subscriberRef.current = {
        onInteractionScheduledWorkCompleted,
        onInteractionTraced,
        onWorkCanceled,
        onWorkScheduled,
        onWorkStarted,
        onWorkStopped,
      };
    }
  }
}

export function unstable_unsubscribe(subscriber: any): void {
  if (enableSchedulerTracing) {
    subscribers.delete(subscriber);

    if (subscribers.size === 0) {
      __subscriberRef.current = null;
    }
  }
}

function onInteractionTraced(interaction: any): void {
  let didCatchError = false;
  let caughtError = null;

  subscribers.forEach(subscriber => {
    try {
      subscriber.onInteractionTraced(interaction);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}

function onInteractionScheduledWorkCompleted(interaction: any): void {
  let didCatchError = false;
  let caughtError = null;

  subscribers.forEach(subscriber => {
    try {
      subscriber.onInteractionScheduledWorkCompleted(interaction);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}

function onWorkScheduled(
  interactions: Set<any>,
  threadID: number,
): void {
  let didCatchError = false;
  let caughtError = null;

  subscribers.forEach(subscriber => {
    try {
      subscriber.onWorkScheduled(interactions, threadID);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}

function onWorkStarted(interactions: Set<any>, threadID: number): void {
  let didCatchError = false;
  let caughtError = null;

  subscribers.forEach(subscriber => {
    try {
      subscriber.onWorkStarted(interactions, threadID);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}

function onWorkStopped(interactions: Set<any>, threadID: number): void {
  let didCatchError = false;
  let caughtError = null;

  subscribers.forEach(subscriber => {
    try {
      subscriber.onWorkStopped(interactions, threadID);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}

function onWorkCanceled(
  interactions: Set<any>,
  threadID: number,
): void {
  let didCatchError = false;
  let caughtError = null;

  subscribers.forEach(subscriber => {
    try {
      subscriber.onWorkCanceled(interactions, threadID);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}
