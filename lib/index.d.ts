import { NextApiRequest, NextApiResponse } from 'next';
declare type Handler = (ctxt: {
    req: NextApiRequest;
    res: NextApiResponse;
    query: Record<string, string>;
}) => Promise<any>;
declare type Args = {
    res: NextApiResponse;
    req: NextApiRequest;
    options?: {
        secondsBeforeRevalidation?: number;
        allowedQueryParams?: string[];
    };
};
export default function withCacheEffectivePage(handler: Handler): ({ req, res, options }: Args) => {
    redirect: {
        destination: string;
        permanent: boolean;
    };
} | Promise<{
    props: {};
}>;
export {};
