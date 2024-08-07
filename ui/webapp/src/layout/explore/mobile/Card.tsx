import isUndefined from 'lodash/isUndefined';
import { createSignal, Match, onMount, Show, Switch } from 'solid-js';

import { Item, Repository, SVGIconKind } from '../../../types';
import cutString from '../../../utils/cutString';
import getItemDescription from '../../../utils/getItemDescription';
import { formatTAGName } from '../../../utils/prepareFilters';
import prettifyNumber from '../../../utils/prettifyNumber';
import ExternalLink from '../../common/ExternalLink';
import FoundationBadge from '../../common/FoundationBadge';
import Image from '../../common/Image';
import MaturityBadge from '../../common/MaturityBadge';
import SVGIcon from '../../common/SVGIcon';
import styles from './Card.module.css';

interface Props {
  item: Item;
  class?: string;
  logoClass?: string;
  isVisible?: boolean;
}

const Card = (props: Props) => {
  const [description, setDescription] = createSignal<string>();
  const [stars, setStars] = createSignal<number>();
  const [numCitations, setCitations] = createSignal<number>();
  const [hIndex, setHIndex] = createSignal<number>();
  const [i10Index, seti10Index] = createSignal<number>();

  onMount(() => {
    setDescription(getItemDescription(props.item));

    if (!isUndefined(props.item.github_org_stats)) {
      setStars(props.item.github_org_stats.stars);
    } else {
      let starsCount: number | undefined;
      if (props.item.repositories) {
        props.item.repositories.forEach((repo: Repository) => {
          if (repo.github_data) {
            starsCount = starsCount || 0 + repo.github_data.stars;
          }
        });
        setStars(starsCount);
      }
    }

    if (props.item.academics && props.item.academics.length > 0) {
      setCitations(props.item.academics[0].citations);
      setHIndex(props.item.academics[0].hindex);
      seti10Index(props.item.academics[0].i10index);

    }
  });

  return (
    <div class={`d-flex flex-column ${props.class}`}>
      <div class="d-flex flex-row align-items-center justify-content-between">
        <div class={`d-flex align-items-center justify-content-center ${styles.logoWrapper}`}>
          <Image
            name={props.item.name}
            class={`m-auto ${styles.logo} ${props.logoClass}`}
            logo={props.item.logo}
            enableLazyLoad
          />
        </div>

        <div class={`p-3 ${styles.itemInfo}`}>
          <div class={`fw-semibold text-truncate mb-1 ${styles.title}`}>{props.item.name}</div>

          <div class={`d-flex flex-row flex-wrap overflow-hidden align-items-center ${styles.extra}`}>
            <Show
              when={!isUndefined(props.item.maturity)}
              fallback={
                <Show when={!isUndefined(props.item.member_subcategory)}>
                  <div
                    title={`${props.item.member_subcategory} member`}
                    class={`badge rounded-0 text-uppercase border me-2 ${styles.badgeOutlineDark}`}
                  >
                    {props.item.member_subcategory} member
                  </div>
                </Show>
              }
            >
              <FoundationBadge class="me-2" />
              <MaturityBadge level={cutString(props.item.maturity!, 20)} class="me-2" />
            </Show>

            <Show when={!isUndefined(props.item.website)}>
              <ExternalLink title="Website" class={`me-2 ${styles.link}`} href={props.item.website!}>
                <SVGIcon kind={SVGIconKind.World} />
              </ExternalLink>
            </Show>

            <Show when={!isUndefined(props.item.twitter_url)}>
              <ExternalLink title="X (Twitter)" class={`me-2 ${styles.link}`} href={props.item.twitter_url!}>
                <SVGIcon kind={SVGIconKind.Twitter} />
              </ExternalLink>
            </Show>
          </div>
        </div>
      </div>
      <div class={`my-3 text-muted ${styles.description}`}>{description()}</div>
      <div
        class={`d-flex flex-row justify-content-between align-items-baseline text-muted mt-auto pt-1 ${styles.additionalInfo}`}
      >
        <div class="d-flex flex-row align-items-center text-nowrap">
          <Switch>
            <Match when={!isUndefined(stars())}>
              <div class="d-flex flex-row align-items-baseline">
                <small class="me-1 text-black-50">GitHub stars:</small>
                <div class="fw-semibold">{stars ? prettifyNumber(stars()!, 1) : '-'}</div>
              </div>
            </Match>
            <Match
              when={
                isUndefined(props.item.maturity) &&
                !isUndefined(props.item.crunchbase_data) &&
                !isUndefined(props.item.crunchbase_data.funding) &&
                props.item.crunchbase_data.funding > 0
              }
            >
              <small class="me-1 text-black-50">Funding:</small>
              <div class="fw-semibold">{prettifyNumber(props.item.crunchbase_data!.funding!)}</div>
            </Match>
          </Switch>
          <Show when={!isUndefined(numCitations())}>
            <div class="p-1 d-flex flex-row align-items-baseline">
              <small class="me-1 text-black-50">Citations:</small>
              <div class="fw-semibold">{numCitations ? prettifyNumber(numCitations()!, 1) : '-'}</div>
            </div>
          </Show>
          <Show when={!isUndefined(hIndex())}>
            <div class="p-1 d-flex flex-row align-items-baseline">
              <small class="me-1 text-black-50">h-index:</small>
              <div class="fw-semibold">{hIndex ? prettifyNumber(hIndex()!, 1) : '-'}</div>
            </div>
          </Show>
          <Show when={!isUndefined(i10Index())}>
            <div class="p-1 d-flex flex-row align-items-baseline">
              <small class="me-1 text-black-50">i10-index:</small>
              <div class="fw-semibold">{i10Index ? prettifyNumber(i10Index()!, 1) : '-'}</div>
            </div>
          </Show>
        </div>

        <Show when={!isUndefined(props.item.tag)}>
          <div
            class={`badge border rounded-0 tagBadge ms-4 mw-100 text-truncate text-uppercase ${styles.badgeOutlineDark}`}
          >
            TAG {formatTAGName(props.item.tag!)}
          </div>
        </Show>
      </div>
    </div>
  );
};

export default Card;
