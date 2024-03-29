import type { NextApiRequest, NextApiResponse } from 'next';

import { connectDB } from '@/modules/database';

export default async function Media(req: NextApiRequest, res: NextApiResponse) {
  const db = (await connectDB).db(process.env.DB_NAME);

  const keyword: {
    type: { [key: string]: RegExp };
    genre: { [key: string]: RegExp };
    updateDay: { [key: string]: RegExp };
  } = {
    type: {
      webtoon: /(?=.*(webtoon).*).*/,
      drama: /(?=.*(drama).*).*/,
      movie: /(?=.*(movie).*).*/,
      anime: /(?=.*(anime).*).*/,
    },
    genre: {
      로맨스: /(?=.*(로맨스|로맨틱|러브|사랑|설레는).*).*/,
      판타지: /(?=.*(판타지|회귀물|차원이동물).*).*/,
      액션: /(?=.*(액션|역동적인|스릴).*).*/,
      무협: /(?=.*(무협|사극).*).*/,
      드라마: /(?=.*(드라마).*).*/,
      일상: /(?=.*(일상|힐링).*).*/,
      코믹: /(?=.*(코믹|웃기는).*).*/,
      공포: /(?=.*(공포|무서운).*).*/,
      스릴러: /(?=.*(|스릴러|스릴).*).*/,
    },
    updateDay: {
      mon: /(mon)/,
      tue: /(the)/,
      wed: /(wed)/,
      thu: /(thu)/,
      fri: /(fri)/,
      sat: /(sat)/,
      sun: /(sun)/,
      finished: /(finished)/,
      naverDaily: /(navberDaily)/,
    },
  };

  if (req.method === 'POST') {
    const filterList: {
      [key: string]: RegExp[];
      title: RegExp[];
      genre: RegExp[];
      type: RegExp[];
      updateDays: RegExp[];
    } = {
      title: [],
      genre: [],
      type: [],
      updateDays: [],
    };

    if (req.body.genre) {
      if (req.body.genre.length < 1) {
        filterList.genre.push(/./);
      } else {
        let genre: string;

        for (genre of req.body.genre) {
          filterList.genre.push(keyword.genre[genre]);
        }
      }
    }

    if (req.body.updateDays) {
      if (req.body.updateDays.length < 1) {
        filterList.updateDays.push(/./);
      } else {
        let updateDay: string;
        for (updateDay of req.body.updateDays) {
          filterList.updateDays.push(keyword.updateDay[updateDay]);
        }
      }
    }

    if (req.body.type) {
      if (req.body.type.length < 1) {
        filterList.type.push(/./);
      } else {
        let type: string;

        for (type of req.body.type) {
          filterList.type.push(keyword.type[type]);
        }
      }
    }

    if (req.body.title) {
      if (req.body.title === '') {
        filterList.title.push(/./);
      } else {
        filterList.title.push(new RegExp(`(?=.*(${req.body.title}).*).*`));
      }
    }

    const filter: { [key: string]: { $in: RegExp[] } }[] = [];
    Object.keys(filterList).forEach((key: string) => {
      filterList[key].forEach((regex: RegExp) => {
        const tempObj: { [key: string]: { $in: RegExp[] } } = {};
        tempObj[key] = { $in: [regex] };
        filter.push(tempObj);
      });
    });

    // console.log(await db.collection('media').find({ type: 'movie' }).toArray());

    const result = await db
      .collection('media')
      .find({ $and: filter })
      .toArray();

    await res.status(200).send(result);
  }
}
